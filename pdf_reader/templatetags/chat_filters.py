# pdfprocessor/templatetags/chat_filters.py
import re
from django import template
from django.utils.safestring import mark_safe

register = template.Library()

@register.filter
def format_code_blocks(value):
    parts = re.split(r'```', value)
    processed = []
    for i, part in enumerate(parts):
        if i % 2 == 1:  # Code block
            processed.append(f'<pre class="code-block"><code>{part.strip()}</code></pre>')
        else:           # Regular text
            processed.append(part.replace('\n', '<br>'))
    return mark_safe(''.join(processed))

@register.filter
def basename(value):
    return value.split('/')[-1]