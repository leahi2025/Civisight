from rest_framework import viewsets
from .models import CountyForm, Form
from .serializers import CountyFormSerializer, FormSerializer
from Civisight.permissions import FormPermission, IsStateOfficial, IsCountyOfficial
from django.db.models import Q
from rest_framework.decorators import action
from rest_framework.decorators import permission_classes as p_classes
from rest_framework.response import Response
#from django.core.mail import send_mail
from states.send_emails.send_email import send_email
from rest_framework.permissions import AllowAny
from rest_framework.exceptions import ValidationError
from counties.models import County
from django.conf import settings
from django.utils import timezone
from django.utils.text import slugify
from django.http import HttpResponse, Http404
import mimetypes
import os
import uuid

class FormViewSet(viewsets.ModelViewSet):
    queryset = Form.objects.all()
    serializer_class = FormSerializer
    permission_classes = [AllowAny] # TODO: change to IsCountyOfficial

    def get_queryset(self):
        qs = super().get_queryset()
        # if IsStateOfficial().has_permission(self.request, self):
        #     return qs
        # return qs.filter(
        #     Q(countyofficial_complete=self.request.user) |
        #     Q(countyofficial_incomplete=self.request.user)
        # )
        return qs
    
    def create(self, request, *args, **kwargs):
        # Build a clean data dict manually - do NOT use request.data.copy() 
        # because it fails with pickle errors when files are present
        data = {}
        for key in request.data:
            if key not in ('file', 'counties'):  # Skip file and counties, handled separately
                val = request.data.get(key)
                data[key] = val
        
        # Extract counties IDs from the incoming data (supports QueryDict, list, single value)
        counties_list = []
        getlist = getattr(request.data, 'getlist', None)
        if callable(getlist):
            counties_list = request.data.getlist('counties')
        else:
            raw = request.data.get('counties')
            if isinstance(raw, (list, tuple)):
                counties_list = list(raw)
            elif raw is not None and raw != "":
                counties_list = [raw]

        # If a file is provided, upload it to Supabase Storage directly and store its public URL
        upload_public_url = None
        file_obj = request.FILES.get('file')
        if file_obj is not None:
            try:
                # Use the 'forms' bucket for form templates (not completed_forms)
                bucket = os.getenv('SUPABASE_S3_BUCKET_NAME') or 'forms'
                # Build date-based path: YYYY/MM/DD/safe-name-<uuid><ext>
                today = timezone.now()
                date_path = today.strftime("%Y/%m/%d")
                original_name = os.path.basename(getattr(file_obj, 'name', 'upload'))
                base, ext = os.path.splitext(original_name)
                safe_base = slugify(base) or 'file'
                uid = uuid.uuid4().hex
                unique_name = f"{date_path}/{safe_base}-{uid}{ext}"
                # Access the client from settings (uppercase attribute)
                sb = getattr(settings, 'SUPABASE_CLIENT', None)
                if sb is None:
                    raise RuntimeError("Supabase client is not configured in settings.")

                # Read bytes and set a reasonable content type for upload
                file_bytes = file_obj.read()
                content_type = getattr(file_obj, 'content_type', None) or 'application/octet-stream'

                # Upload the file to Supabase Storage using bytes
                # Set content-type so browsers render PDFs instead of showing gibberish
                try:
                    res = sb.storage.from_(bucket).upload(
                        unique_name,
                        file_bytes,
                        file_options={
                            "content-type": content_type,
                        },
                    )
                except TypeError:
                    # Some client versions accept file_options as positional
                    try:
                        res = sb.storage.from_(bucket).upload(
                            unique_name,
                            file_bytes,
                            {"content-type": content_type},
                        )
                    except TypeError:
                        # Fallback without options
                        res = sb.storage.from_(bucket).upload(unique_name, file_bytes)
                # Normalize possible error shapes
                if isinstance(res, dict):
                    err = res.get('error') or (res.get('data') and res['data'].get('error'))
                    if err:
                        raise RuntimeError(f"Supabase upload error: {err}")

                # Store the object key in url; serializer will expose a resolved URL
                data['url'] = unique_name
            except Exception as e:
                return Response({
                    "detail": f"Supabase upload failed: {e}",
                    "error_type": type(e).__name__,
                    "hint": "Ensure server uses SUPABASE_SERVICE_KEY and bucket allows inserts; verify bucket name exists.",
                    "bucket": bucket if 'bucket' in locals() else None,
                    "object": unique_name if 'unique_name' in locals() else None,
                }, status=500)

        # Create the form using sanitized data (file and counties already excluded)
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        form = serializer.save()
        # If the form is marked completed, ensure next_notify_date is cleared
        try:
            from datetime import timedelta
            if form.is_completed:
                if form.next_notify_date is not None:
                    form.next_notify_date = None
                    form.save(update_fields=['next_notify_date'])
            else:
                # If notify_every is set and next_notify_date not provided, initialize it
                if (not form.next_notify_date) and getattr(form, 'notify_every', None):
                    try:
                        days = int(form.notify_every)
                    except Exception:
                        days = None
                    if days and days > 0:
                        form.next_notify_date = timezone.now() + timedelta(days=days)
                        form.save(update_fields=['next_notify_date'])
        except Exception:
            # Non-fatal: continue creation even if scheduling logic fails
            pass
        
        # Create CountyForm relationships
        for county_id in counties_list:
            try:
                county = County.objects.get(id=county_id)
                CountyForm.objects.create(
                    county=county,
                    form=form,
                    status='pending'
                )
            except County.DoesNotExist:
                pass  # Skip if county doesn't exist
        
        return Response(serializer.data, status=201)

    def update(self, request, *args, **kwargs):
        """
        Override update to handle counties properly via CountyForm through model.
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Extract counties from request data before passing to serializer
        counties_list = []
        getlist = getattr(request.data, 'getlist', None)
        if callable(getlist):
            counties_list = request.data.getlist('counties')
        else:
            raw = request.data.get('counties')
            if isinstance(raw, (list, tuple)):
                counties_list = list(raw)
            elif raw is not None and raw != "":
                counties_list = [raw]
        
        # Call parent update (this will handle the Form fields)
        response = super().update(request, *args, **kwargs)
        
        # Now sync CountyForm records if counties were provided
        if 'counties' in request.data or counties_list:
            try:
                # Delete existing CountyForm records for this form
                CountyForm.objects.filter(form=instance).delete()
                
                # Create new CountyForm records for the assigned counties
                for county_id in counties_list:
                    try:
                        county = County.objects.get(id=county_id)
                        CountyForm.objects.create(
                            county=county,
                            form=instance,
                            status='pending'
                        )
                    except County.DoesNotExist:
                        pass  # Skip if county doesn't exist
            except Exception as e:
                # Log but don't fail the update
                print(f"Error syncing counties for form {instance.id}: {e}")
        
        return response

    @action(detail=True, methods=["get"], url_path="file")
    def serve_file(self, request, pk=None):
        """
        Streams the stored form file from Supabase Storage with correct headers.
        - Inline for PDFs so browsers render them.
        - Attachment for other types.
        - Redirects to external URLs if form.url is a full URL.
        """
        form = self.get_object()
        key = form.url
        if not key:
            raise Http404("No file associated with this form")

        # If the URL is an external link (not a Supabase key), redirect to it
        if key.startswith("http://") or key.startswith("https://"):
            from django.shortcuts import redirect
            return redirect(key)

        bucket = os.getenv('SUPABASE_S3_BUCKET_NAME') or 'forms'
        sb = getattr(settings, 'SUPABASE_CLIENT', None)
        if sb is None:
            return Response({"detail": "Supabase client is not configured in settings."}, status=500)

        try:
            blob = sb.storage.from_(bucket).download(key)
            # Normalize client return shapes
            if isinstance(blob, dict):
                if blob.get('error'):
                    return Response({"detail": f"Supabase download failed: {blob['error']}"}, status=500)
                file_bytes = blob.get('data') or blob.get('file') or b''
            else:
                file_bytes = blob
        except Exception as e:
            return Response({"detail": f"Supabase download failed: {e}"}, status=500)

        ctype, _ = mimetypes.guess_type(key)
        ctype = ctype or 'application/octet-stream'
        resp = HttpResponse(file_bytes, content_type=ctype)
        filename = os.path.basename(key)
        if ctype == 'application/pdf':
            resp["Content-Disposition"] = f'inline; filename="{filename}"'
        else:
            resp["Content-Disposition"] = f'attachment; filename="{filename}"'
        # Remove X-Frame-Options so other origins (localhost:3000) can embed
        if 'X-Frame-Options' in resp:
            del resp['X-Frame-Options']
        return resp

    @action(detail=True, methods=["post"])
    @p_classes([IsStateOfficial])
    def remind(self, request, pk=None):
        """
        POST /api/forms/{pk}/remind/
        Sends reminder emails to all county officials in counties where this form is incomplete.
        Only state officials can call this endpoint.
        """
        form = self.get_object()
        county_id = request.data.get("county_id")
        
        if not county_id:
            return Response({"error": "county_id is required"}, status=400)
        
        # Get the county and all its officials
        try:
            county = County.objects.get(id=county_id)
        except County.DoesNotExist:
            return Response({"error": "County not found"}, status=404)
        
        # Get all CountyOfficial users for this county
        from accounts.models import CountyOfficial
        county_officials = CountyOfficial.objects.filter(county=county)
        
        # Get the CountyForm to check if it's incomplete
        county_form = CountyForm.objects.filter(form=form, county=county).first()
        if not county_form:
            return Response({"error": "Form not assigned to this county"}, status=404)
        
        if county_form.status == 'completed':
            return Response({"message": "Form is already completed for this county", "sent_to": []}, status=200)
        
        # Send reminders to all county officials
        sent_to = []
        for official in county_officials:
            if official.email:
                try:
                    send_email(
                        subject=f"Reminder: Please complete {form.name}",
                        body=f"This is a reminder to complete the form '{form.name}' assigned to {county.name} County. Due date: {form.finish_by.strftime('%B %d, %Y at %I:%M %p') if form.finish_by else 'Not specified'}.",
                        receiver_email=official.email,
                    )
                    sent_to.append(official.email)
                except Exception as e:
                    print(f"Failed to send email to {official.email}: {e}")
        
        return Response({"sent_to": sent_to, "message": f"Reminders sent to {len(sent_to)} county official(s)"})
    
class CountyFormViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny] # TODO: change to IsCountyOfficial
    queryset = CountyForm.objects.all()
    serializer_class = CountyFormSerializer

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Handle file upload for completed forms
        completed_file = request.FILES.get('completed_file')
        if completed_file:
            try:
                # Use the completed_forms bucket (separate from regular forms bucket)
                bucket = os.getenv('SUPABASE_S3_COMPLETED_FORMS_FOLDER') or 'completed_forms'
                
                # Build path: {form_id}/{county_id}/{user_id}/filename
                form_id = instance.form_id
                county_id = instance.county_id
                user_id = request.user.id if request.user.is_authenticated else 'anonymous'
                
                # Create a safe filename
                original_name = os.path.basename(getattr(completed_file, 'name', 'upload'))
                base, ext = os.path.splitext(original_name)
                safe_base = slugify(base) or 'completed-form'
                uid = uuid.uuid4().hex[:8]
                unique_name = f"{form_id}/{county_id}/{user_id}/{safe_base}-{uid}{ext}"
                
                # Get the Supabase client
                sb = getattr(settings, 'SUPABASE_CLIENT', None)
                if sb is None:
                    return Response({"error": "Supabase client is not configured"}, status=500)
                
                # Read file bytes and upload
                file_bytes = completed_file.read()
                content_type = getattr(completed_file, 'content_type', None) or 'application/octet-stream'
                
                try:
                    res = sb.storage.from_(bucket).upload(
                        unique_name,
                        file_bytes,
                        file_options={"content-type": content_type},
                    )
                except TypeError:
                    try:
                        res = sb.storage.from_(bucket).upload(
                            unique_name,
                            file_bytes,
                            {"content-type": content_type},
                        )
                    except TypeError:
                        res = sb.storage.from_(bucket).upload(unique_name, file_bytes)
                
                # Check for upload errors
                if isinstance(res, dict):
                    err = res.get('error') or (res.get('data') and res['data'].get('error'))
                    if err:
                        return Response({"error": f"Supabase upload error: {err}"}, status=500)
                
                # Store the object key in completed_file_url
                instance.completed_file_url = unique_name
                instance.save(update_fields=['completed_file_url'])
                
            except Exception as e:
                return Response({
                    "error": f"File upload failed: {e}",
                    "hint": "Ensure Supabase bucket exists and allows inserts"
                }, status=500)
        
        # Now proceed with the normal partial update (status change, etc.)
        response = super().partial_update(request, *args, **kwargs)
        
        # Refresh instance from database to get updated status
        instance.refresh_from_db()
        
        print(f"[DEBUG] CountyForm {instance.id} status after update: {instance.status}")

        # If a county marks the form completed, update parent Form and notify state officials
        try:
            if instance.status == 'completed' and instance.form_id:
                print(f"[DEBUG] Form is completed, checking if all counties are done...")
                # If all related CountyForms are completed, mark the Form completed
                remaining = CountyForm.objects.filter(form_id=instance.form_id).exclude(status='completed').exists()
                if not remaining:
                    if not instance.form.is_completed:
                        instance.form.is_completed = True
                        instance.form.completed_at = timezone.now()
                        instance.form.next_notify_date = None
                        instance.form.save(update_fields=['is_completed', 'completed_at', 'next_notify_date'])
                
                # Send email notification to state officials
                try:
                    county = instance.county
                    form = instance.form
                    state = county.state
                    
                    if state:
                        from accounts.models import StateOfficial, CountyOfficial
                        state_officials = StateOfficial.objects.filter(state=state)
                        
                        # Determine who submitted the form
                        submitter_name = "Unknown"
                        submitter_type = "user"
                        if request.user.is_authenticated:
                            submitter_name = request.user.email or request.user.username
                            if StateOfficial.objects.filter(pk=request.user.pk).exists():
                                submitter_type = "State Official"
                            elif CountyOfficial.objects.filter(pk=request.user.pk).exists():
                                submitter_type = "County Official"
                        
                        # Build the download link for the completed file
                        file_link = ""
                        if instance.completed_file_url:
                            # Generate a signed URL or provide a dashboard link
                            file_link = f"\n\nDownload the completed form: {request.build_absolute_uri(f'/api/forms/county-forms/{instance.id}/completed-file/')}"
                        
                        for official in state_officials:
                            if official.email:
                                try:
                                    send_email(
                                        subject=f"Form Completed: {form.name} by {county.name}",
                                        body=f"{county.name} County has completed the form '{form.name}'.\n\nSubmitted by: {submitter_name} ({submitter_type}){file_link}\n\nSubmitted on: {timezone.now().strftime('%B %d, %Y at %I:%M %p')}",
                                        receiver_email=official.email,
                                    )
                                except Exception as e:
                                    print(f"Failed to send completion email to {official.email}: {e}")
                except Exception as e:
                    print(f"Failed to notify state officials: {e}")
                    
        except Exception:
            # Non-fatal; keep the partial update response even if aggregation update fails
            pass

        return response

    @action(detail=True, methods=["get"], url_path="completed-file")
    def serve_completed_file(self, request, pk=None):
        """
        GET /api/forms/county-forms/{pk}/completed-file/
        Streams the completed form file from Supabase Storage.
        """
        county_form = self.get_object()
        key = county_form.completed_file_url
        
        if not key:
            raise Http404("No completed file for this submission")
        
        bucket = os.getenv('SUPABASE_S3_COMPLETED_FORMS_FOLDER') or 'completed_forms'
        sb = getattr(settings, 'SUPABASE_CLIENT', None)
        if sb is None:
            return Response({"error": "Supabase client is not configured"}, status=500)
        
        try:
            blob = sb.storage.from_(bucket).download(key)
            if isinstance(blob, dict):
                if blob.get('error'):
                    return Response({"error": f"Download failed: {blob['error']}"}, status=500)
                file_bytes = blob.get('data') or blob.get('file') or b''
            else:
                file_bytes = blob
        except Exception as e:
            return Response({"error": f"Download failed: {e}"}, status=500)
        
        ctype, _ = mimetypes.guess_type(key)
        ctype = ctype or 'application/octet-stream'
        resp = HttpResponse(file_bytes, content_type=ctype)
        filename = os.path.basename(key)
        if ctype == 'application/pdf':
            resp["Content-Disposition"] = f'inline; filename="{filename}"'
        else:
            resp["Content-Disposition"] = f'attachment; filename="{filename}"'
        return resp