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
    const qualitySlider = document.getElementById('qualitySlider');
    const qualityValue = document.getElementById('qualityValue');
    const compressedSizeJPG = document.getElementById('compressedSizeJPG');
    const compressedSizePNG = document.getElementById('compressedSizePNG');
    const compressedSizeWebP = document.getElementById('compressedSizeWebP');
    const compressionRatioJPG = document.getElementById('compressionRatioJPG');
    const compressionRatioPNG = document.getElementById('compressionRatioPNG');
    const compressionRatioWebP = document.getElementById('compressionRatioWebP');
    const downloadAllBtn = document.getElementById('downloadAllBtn');

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

    // 添加滑块变化事件监听
    qualitySlider.addEventListener('input', function() {
        qualityValue.textContent = this.value + '%';
        if (preview.src) {
            calculateCompressedSizes(preview, this.value / 100);
        }
    });

    // 添加下载所有图片的事件监听器
    downloadAllBtn.addEventListener('click', downloadAllImages);

    // 创建一个数组来存储所有的下载信息
    let downloadItems = [];

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
        downloadItems = []; // 清空下载项数组
        resultSection.style.display = 'block';
        
        const quality = qualitySlider.value / 100;

        // 转换为不同格式（带压缩）
        convertToFormat(img, 'image/webp', 'converted.webp', quality);
        convertToFormat(img, 'image/jpeg', 'converted.jpg', quality);
        convertToFormat(img, 'image/png', 'converted.png', quality);
        
        // 生成不同尺寸的PNG图标
        createResizedPNG(img, 16, quality);
        createResizedPNG(img, 48, quality);
        createResizedPNG(img, 128, quality);
        
        // 添加 ICO 转换
        createICO(img, quality);
    }

    function convertToFormat(img, format, fileName, quality) {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
            if (blob) {
                displayResult(blob, fileName, `${img.naturalWidth}x${img.naturalHeight}`);
            }
        }, format, quality);
    }

    function createResizedPNG(img, size, quality) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        const scale = Math.min(size / img.naturalWidth, size / img.naturalHeight);
        const width = img.naturalWidth * scale;
        const height = img.naturalHeight * scale;
        
        const x = (size - width) / 2;
        const y = (size - height) / 2;
        
        ctx.drawImage(img, x, y, width, height);
        
        canvas.toBlob((blob) => {
            if (blob) {
                displayResult(blob, `icon${size}.png`, `${size}x${size}`);
            }
        }, 'image/png', quality);
    }

    function displayResult(blob, fileName, dimensions) {
        // 存储下载信息
        downloadItems.push({
            blob: blob,
            fileName: fileName
        });

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

    // 添加计算压缩大小的函数
    function calculateCompressedSizes(img, quality) {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        // 获取原始文件大小
        const originalSize = parseInt(fileSize.textContent);
        
        // 计算 JPEG 压缩大小
        canvas.toBlob((blob) => {
            if (blob) {
                const newSize = blob.size;
                const ratio = ((1 - newSize / originalSize) * 100).toFixed(2);
                compressedSizeJPG.textContent = formatFileSize(newSize);
                compressionRatioJPG.textContent = `节省 ${ratio}%`;
            }
        }, 'image/jpeg', quality);
        
        // 计算 PNG 压缩大小
        canvas.toBlob((blob) => {
            if (blob) {
                const newSize = blob.size;
                const ratio = ((1 - newSize / originalSize) * 100).toFixed(2);
                compressedSizePNG.textContent = formatFileSize(newSize);
                compressionRatioPNG.textContent = `节省 ${ratio}%`;
            }
        }, 'image/png', quality);
        
        // 计算 WebP 压缩大小
        canvas.toBlob((blob) => {
            if (blob) {
                const newSize = blob.size;
                const ratio = ((1 - newSize / originalSize) * 100).toFixed(2);
                compressedSizeWebP.textContent = formatFileSize(newSize);
                compressionRatioWebP.textContent = `节省 ${ratio}%`;
            }
        }, 'image/webp', quality);
    }

    // 添加错误处理
    function handleCompressionError(format, sizeElement, ratioElement) {
        sizeElement.textContent = '不支持';
        ratioElement.textContent = '不支持';
    }

    // 添加下载所有图片的函数
    function downloadAllImages() {
        // 创建一个 ZIP 文件
        const zip = new JSZip();
        
        // 将所有图片添加到 ZIP 中
        downloadItems.forEach(item => {
            zip.file(item.fileName, item.blob);
        });
        
        // 生成并下载 ZIP 文件
        zip.generateAsync({type: "blob"})
            .then(function(content) {
                const zipUrl = URL.createObjectURL(content);
                const link = document.createElement('a');
                link.href = zipUrl;
                link.download = "converted_images.zip";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(zipUrl);
            });
    }

    // 添加 createICO 函数
    function createICO(img, quality) {
        // ICO 通常包含多个尺寸的图标
        const sizes = [16, 32, 48];
        const pngBlobs = [];
        
        // 创建所有尺寸的 PNG
        const createAllSizes = sizes.map(size => {
            return new Promise(resolve => {
                const canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');
                
                // 计算缩放和居中
                const scale = Math.min(size / img.naturalWidth, size / img.naturalHeight);
                const width = img.naturalWidth * scale;
                const height = img.naturalHeight * scale;
                const x = (size - width) / 2;
                const y = (size - height) / 2;
                
                ctx.drawImage(img, x, y, width, height);
                
                canvas.toBlob(blob => {
                    pngBlobs.push({
                        size: size,
                        blob: blob
                    });
                    resolve();
                }, 'image/png', quality);
            });
        });

        // 当所有尺寸都创建完成后
        Promise.all(createAllSizes).then(() => {
            // 创建 ICO 文件
            createICOFromPNGs(pngBlobs).then(icoBlob => {
                displayResult(icoBlob, 'favicon.ico', `${sizes.join('x')}px`);
            });
        });
    }

    // 添加创建 ICO 文件的函数
    function createICOFromPNGs(pngBlobs) {
        return new Promise(async (resolve) => {
            // ICO 文件头
            const header = new Uint8Array([
                0, 0,             // 保留，必须为0
                1, 0,             // 图像类型，1=ICO
                pngBlobs.length, 0 // 图像数量
            ]);

            // 收集所有数据
            const headerSize = 6;
            const directorySize = 16 * pngBlobs.length;
            let offset = headerSize + directorySize;
            const directory = [];
            const imageData = [];

            // 处理每个PNG
            for (const png of pngBlobs) {
                const arrayBuffer = await png.blob.arrayBuffer();
                const data = new Uint8Array(arrayBuffer);
                
                // 创建目录条目
                const entry = new Uint8Array([
                    png.size, png.size, // 宽度和高度
                    0,                  // 调色板颜色数
                    0,                  // 保留
                    1, 0,               // 颜色平面
                    32, 0,              // 位数
                    data.length & 0xFF, (data.length >> 8) & 0xFF, (data.length >> 16) & 0xFF, (data.length >> 24) & 0xFF, // 图像大小
                    offset & 0xFF, (offset >> 8) & 0xFF, (offset >> 16) & 0xFF, (offset >> 24) & 0xFF // 图像偏移
                ]);

                directory.push(entry);
                imageData.push(data);
                offset += data.length;
            }

            // 合并所有数据
            const finalSize = headerSize + directorySize + imageData.reduce((sum, data) => sum + data.length, 0);
            const finalData = new Uint8Array(finalSize);
            
            // 复制头部
            finalData.set(header, 0);
            
            // 复制目录
            let pos = headerSize;
            directory.forEach(entry => {
                finalData.set(entry, pos);
                pos += 16;
            });
            
            // 复制图像数据
            imageData.forEach(data => {
                finalData.set(data, pos);
                pos += data.length;
            });

            resolve(new Blob([finalData], { type: 'image/x-icon' }));
        });
    }
}); 