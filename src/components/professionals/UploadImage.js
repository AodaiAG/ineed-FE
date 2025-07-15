import React, { useState, useRef,useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { API_URL } from '../../utils/constans';
import axios from 'axios';
import styles from '../../styles/UploadImage.module.css';
import { useLanguage } from '../../contexts/LanguageContext';

function UploadImage({ initialImage, onImageUpload }) {
    const [originalImage, setOriginalImage] = useState(initialImage || "/images/Prof/w.png");
    const [image, setImage] = useState(originalImage);
    const [showCropper, setShowCropper] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isPictureLoading, setIsPictureLoading] = useState(false);
    const fileInputRef = useRef(null);
    const { translation } = useLanguage();

    useEffect(() => {
        setOriginalImage(initialImage); // Ensure state is updated with new prop if it changes
        setImage(initialImage);
    }, [initialImage]);

    const handleUploadButtonClick = () => {
        fileInputRef.current.click();
    };



    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            setIsPictureLoading(true);
            const fileUrl = URL.createObjectURL(file);
            setOriginalImage(fileUrl);
            setImage(fileUrl);
            setShowCropper(true);
            setIsPictureLoading(false);
        }
    };

    const handleCropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const getCroppedImage = async () => {
        const imageFile = await createImage(originalImage);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;

        ctx.drawImage(
            imageFile,
            croppedAreaPixels.x,
            croppedAreaPixels.y,
            croppedAreaPixels.width,
            croppedAreaPixels.height,
            0,
            0,
            croppedAreaPixels.width,
            croppedAreaPixels.height
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                const file = new File([blob], "cropped-image.jpg", { type: 'image/jpeg' });
                resolve(file);
            }, 'image/jpeg');
        });
    };

    const saveCroppedImage = async () => {
        setShowCropper(false); // Close cropper immediately
        setIsPictureLoading(true);  // Start loading spinner
    
        const croppedImageFile = await getCroppedImage();
        const formData = new FormData();
        formData.append('image', croppedImageFile);
    
        try {
            const response = await axios.post(`${API_URL}/professionals/upload-image`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
    
            const serverImageUrl = response.data.imageUrl;
            setImage(serverImageUrl);  // Update local image state
            setOriginalImage(serverImageUrl);  // Update original image state
            setIsPictureLoading(false);  // Stop loading spinner
    
            // Pass the URL back to the parent
            if (onImageUpload) onImageUpload(serverImageUrl);
        } catch (error) {
            console.error('Error uploading image:', error);
            setIsPictureLoading(false);  // Stop loading spinner in case of error
        }
    };
    

    const createImage = (url) =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.crossOrigin = 'anonymous';
            image.src = url;
            image.onload = () => resolve(image);
            image.onerror = (error) => reject(error);
        });

        return (
            <div className={styles['upload-image-container']}>
                {isPictureLoading ? (
                    <div className={styles['loading-spinner']}></div>
                ) : (
                    <>
                        <img
                            src={image}
                            alt="Uploaded"
                            className={styles['preview-image']}
                            style={{ objectFit: 'cover' }}
                        />
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                        />
                        <div className={styles['button-group']}>
                            <button onClick={handleUploadButtonClick} className={styles['replace-button']}>
                                {image === "/images/Prof/w.png" ? translation.addPicture : translation.replacePicture}
                            </button>
                            {image !== "/images/Prof/w.png" && (
                                <button onClick={() => setShowCropper(true)} className={styles['edit-button']}>{translation.edit}</button>
                            )}
                        </div>
                    </>
                )}
                {showCropper && (
                    <div className={styles['cropper-popup']}>
                        <div className={styles['cropper-controls']}>
                            <div className={styles['crop-container']}>
                                <Cropper
                                    image={originalImage}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={1}
                                    onCropChange={setCrop}
                                    onZoomChange={setZoom}
                                    onCropComplete={handleCropComplete}
                                />
                            </div>
                            <button className={styles['save-button']} onClick={saveCroppedImage}>
                                {translation.save}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
}

export default UploadImage;
