import glob, re

for ext in ('*.html', 'assets/css/*.css'):
    for filepath in glob.glob(ext):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        old_content = content

        content = re.sub(r'family=Cormorant\+Garamond:[^&\'"]+', '', content)
        content = re.sub(r'family=Inter:[^&\'"]+', '', content)
        content = re.sub(r'family=Baloo\+2:[^&\'"]+', '', content)
        content = re.sub(r'family=Nunito:[^&\'"]+', '', content)
        
        content = content.replace("'Baloo 2', cursive", "'Playfair Display', serif")
        content = content.replace('"Baloo 2", cursive', "'Playfair Display', serif")
        
        content = content.replace("'Inter', sans-serif", "'Be Vietnam Pro', sans-serif")
        content = content.replace('"Inter", sans-serif', "'Be Vietnam Pro', sans-serif")

        content = content.replace("'Cormorant Garamond', serif", "'Playfair Display', serif")
        content = content.replace('"Cormorant Garamond", serif', "'Playfair Display', serif")

        content = content.replace('?&family=', '?family=')
        content = content.replace('&&', '&')
        content = content.replace('family=&', '')
        
        if content != old_content:
            with open(filepath, 'w', encoding='utf-8') as fw:
                fw.write(content)
            print(f'Updated fonts in: {filepath}')
