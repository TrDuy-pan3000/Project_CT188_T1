import os
import glob
from rembg import remove
from PIL import Image

def remove_background(img_path, output_path):
    try:
        input_image = Image.open(img_path)
        output_image = remove(input_image)
        output_image.save(output_path, "PNG")
        print(f"Processed: {img_path} -> {output_path}")
    except Exception as e:
        print(f"Error processing {img_path}: {e}")

img_dir = 'd:/Nhập môn web/Project-T1/assets/images'
icons_to_process = glob.glob(os.path.join(img_dir, 'b*.png'))

for img_path in icons_to_process:
    remove_background(img_path, img_path)
