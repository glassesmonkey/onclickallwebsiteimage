document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');
    const imageInput = document.getElementById('imageInput');
    const previewSection = document.getElementById('previewSection');
    const resultSection = document.getElementById('resultSection');
    const preview = document.getElementById('preview');
    const originalSize = document.getElementById('originalSize');
    const fileSize = document.getElementById('fileSize');
    const convertBtn = document.getElementById('convertBtn');
    const resultGrid = document.getElementById('resultGrid');

    // 拖拽上传
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#2196f3';
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#ccc';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#ccc';
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleImage(files[0]);
        }
    });

    // 点击上传
    imageInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleImage(e.target.files[0]);
        }
    });

    // 转换按钮点击事件
    convertBtn.addEventListener('click', () => {
        const img = preview;
        convertImages(img);
    });

    function handleImage(file) {
        // 验证文件格式
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/svg+xml'];
        if (!validTypes.includes(file.type)) {
            alert('请上传支持的图片格式！');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.onload = function() {
                originalSize.textContent = `${this.naturalWidth}x${this.naturalHeight}`;
                fileSize.textContent = formatFileSize(file.size);
                previewSection.style.display = 'block';
                resultSection.style.display = 'none';
            };
        };
        reader.readAsDataURL(file);
    }

    function convertImages(img) {
        resultGrid.innerHTML = '';
        resultSection.style.display = 'block';

        // 转换为不同格式
        convertToFormat(img, 'image/webp', 'converted.webp');
        convertToFormat(img, 'image/png', 'converted.png');
        
        // 生成不同尺寸的PNG图标
        createResizedPNG(img, 16);
        createResizedPNG(img, 48);
        createResizedPNG(img, 128);
    }

    function convertToFormat(img, format, fileName) {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
            if (blob) {
                displayResult(blob, fileName, `${img.naturalWidth}x${img.naturalHeight}`);
            }
        }, format);
    }

    function createResizedPNG(img, size) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // 保持宽高比例
        const scale = Math.min(size / img.naturalWidth, size / img.naturalHeight);
        const width = img.naturalWidth * scale;
        const height = img.naturalHeight * scale;
        
        // 居中绘制
        const x = (size - width) / 2;
        const y = (size - height) / 2;
        
        ctx.drawImage(img, x, y, width, height);
        
        canvas.toBlob((blob) => {
            if (blob) {
                displayResult(blob, `icon${size}.png`, `${size}x${size}`);
            }
        }, 'image/png');
    }

    function displayResult(blob, fileName, dimensions) {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        
        const img = document.createElement('img');
        img.src = URL.createObjectURL(blob);
        
        const info = document.createElement('div');
        info.innerHTML = `
            <p>${fileName}</p>
            <p>尺寸: ${dimensions}</p>
            <p>大小: ${formatFileSize(blob.size)}</p>
        `;
        
        const downloadBtn = document.createElement('a');
        downloadBtn.href = URL.createObjectURL(blob);
        downloadBtn.download = fileName;
        downloadBtn.className = 'download-btn';
        downloadBtn.textContent = '下载';
        
        resultItem.appendChild(img);
        resultItem.appendChild(info);
        resultItem.appendChild(downloadBtn);
        resultGrid.appendChild(resultItem);
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}); 