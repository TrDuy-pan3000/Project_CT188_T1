import glob, re

target = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap'

for filepath in glob.glob('*.html') + glob.glob('assets/css/*.css'):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace the full url string
    new_content = re.sub(r'https://fonts\.googleapis\.com/css2\?[^\'"]+', target, content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as fw:
            fw.write(new_content)
        print(f'Updated {filepath}')
