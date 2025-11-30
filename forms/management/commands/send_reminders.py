from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from forms.models import Form, CountyForm
from counties.models import County
from accounts.models import CountyOfficial
from states.send_emails.send_email import send_email

class Command(BaseCommand):
    help = 'Send scheduled reminder emails for forms whose next_notify_date has passed.'

    def handle(self, *args, **options):
        now = timezone.now()
        forms = Form.objects.filter(is_completed=False, next_notify_date__isnull=False, next_notify_date__lte=now)
        total_sent = 0
        for form in forms:
            try:
                notify_days = getattr(form, 'notify_every', None) or 0
                try:
                    notify_days = int(notify_days)
                except Exception:
                    notify_days = 0

                # Find counties where the form is not completed
                county_forms = CountyForm.objects.filter(form=form).exclude(status='completed')
                for cf in county_forms:
                    county = cf.county
                    officials = CountyOfficial.objects.filter(county=county)
                    for official in officials:
                        if official.email:
                            try:
                                send_email(
                                    subject=f"Reminder: Please complete {form.name}",
                                    body=f"This is a reminder to complete the form '{form.name}' assigned to {county.name} County. Due date: {form.finish_by.strftime('%B %d, %Y at %I:%M %p') if form.finish_by else 'Not specified'}.",
                                    receiver_email=official.email,
                                )
                                total_sent += 1
                            except Exception as e:
                                self.stderr.write(f"Failed to send to {official.email}: {e}")

                # Advance the next_notify_date if notify_every is set, otherwise clear it
                if notify_days and notify_days > 0:
                    # Use now + notify_days to schedule the next run
                    form.next_notify_date = now + timedelta(days=notify_days)
                else:
                    form.next_notify_date = None
                form.save(update_fields=['next_notify_date'])
            except Exception as e:
                self.stderr.write(f"Error processing form {form.id}: {e}")

        self.stdout.write(self.style.SUCCESS(f"Reminders processed. Emails sent: {total_sent}"))
