# pdfprocessor/models.py
from django.utils import timezone
import uuid
import os
from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

User = get_user_model()

def validate_pdf(value):
    if not value.name.endswith('.pdf'):
        raise ValidationError('Only PDF files are allowed')

def user_pdf_upload_path(instance, filename):
    # Save files to: media/user_<id>/pdfs/<uuid>_<filename>
    return f'user_{instance.user.id}/pdfs/{uuid.uuid4()}_{filename}'

class PDFDocument(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    original_filename = models.CharField(max_length=255)
    uploaded_file = models.FileField(
        upload_to=user_pdf_upload_path,
        validators=[validate_pdf]
    )
    vector_db_path = models.CharField(max_length=500)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    processed = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.pk:  # Only on creation
            self.original_filename = self.uploaded_file.name
            self.vector_db_path = os.path.join(
                settings.BASE_DIR,
                'vector_dbs',
                f'user_{self.user.id}',
                f'doc_{uuid.uuid4()}'
            )
        super().save(*args, **kwargs)



class ChatMessage(models.Model):
    pdf_document = models.ForeignKey(PDFDocument, on_delete=models.CASCADE, related_name='messages')
    message = models.TextField()  # User's question
    response = models.TextField()  # AI's answer
    sources = models.JSONField(default=list)  # List of source metadata
    timestamp = models.DateTimeField(default=timezone.now)

    def get_unique_sources(self):
        seen = set()
        unique_sources = []
        for source in self.sources:
            source_path = source.get('source', '')
            if source_path not in seen:
                seen.add(source_path)
                unique_sources.append(source_path)
        return unique_sources