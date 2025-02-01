from django.contrib import admin
from .models import PDFDocument,ChatMessage

# Register your models here.
admin.site.register(PDFDocument)
admin.site.register(ChatMessage)