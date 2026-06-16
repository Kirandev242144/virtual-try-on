"use client";

import { useState, useRef, useEffect } from 'react';
import { X, Upload, Sparkles, CheckCircle, Info } from 'lucide-react';
import Image from 'next/image';
import styles from './TryOnModal.module.css';

interface TryOnModalProps {
    isOpen: boolean;
    onClose: () => void;
    garmentImage?: string;
    category?: string;
}

type ModalState = 'UPLOAD' | 'SCANNING' | 'RESULT';
type Category = 'tops' | 'bottoms' | 'one-pieces';

const TryOnModal = ({ isOpen, onClose, garmentImage, category = 'tops' }: TryOnModalProps) => {
    const [state, setState] = useState<ModalState>('UPLOAD');
    const [sourceImage, setSourceImage] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'original' | 'generated'>('generated');
    const [statusMessage, setStatusMessage] = useState("Initializing...");
    const [selectedCategory, setSelectedCategory] = useState<Category>(category as Category);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset state when opening/closing
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setState('UPLOAD');
                setImagePreview(null);
                setSourceImage(null);
                setViewMode('generated');
                setSelectedCategory(category as Category);
            }, 300);
        } else {
            setSelectedCategory(category as Category);
        }
    }, [isOpen, category]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setSourceImage(result); // Store original
                setImagePreview(result); // Show initially
                startScanning(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const startScanning = async (uploadedImage?: string) => {
        const imgToUse = uploadedImage || sourceImage;
        if (!imgToUse) {
            alert("No image to scan!");
            return;
        }

        setState('SCANNING');
        setStatusMessage("Uploading and analysing...");

        try {
            // Convert Data URL to Blob
            const response = await fetch(imgToUse);
            const blob = await response.blob();
            const file = new File([blob], "person.png", { type: "image/png" });

            // Prepare Form Data
            const formData = new FormData();
            formData.append('person_image', file);

            // Handle Garment Image
            if (garmentImage) {
                try {
                    const garmentRes = await fetch(garmentImage);
                    const garmentBlob = await garmentRes.blob();
                    formData.append('garment_image', new File([garmentBlob], "garment.png", { type: "image/png" }));
                } catch (e) {
                    console.error("Failed to fetch garment image", e);
                    throw new Error("Failed to load garment image");
                }
            } else {
                // Fallback garment for demo
                const garmentRes = await fetch("/ui_hoodie.png");
                if (!garmentRes.ok) {
                    alert("Fallback garment failed!");
                    setState('UPLOAD');
                    return;
                }
                const garmentBlob = await garmentRes.blob();
                formData.append('garment_image', new File([garmentBlob], "garment.png", { type: "image/png" }));
            }

            formData.append('category', selectedCategory);

            setStatusMessage("Submitting try-on job to RunPod serverless...");

            // First, try the secure Next.js server-side route
            const localApiUrl = '/api/try-on';
            console.log(`Submitting image data to secure server-side endpoint: ${localApiUrl}`);
            
            const apiResponse = await fetch(localApiUrl, {
                method: 'POST',
                body: formData,
            });

            if (!apiResponse.ok) {
                const errorData = await apiResponse.json();
                
                // If server-side keys are missing, gracefully fall back to direct proxy endpoint (old client-side behavior)
                if (errorData.error && errorData.error.includes("environment variables")) {
                    const fallbackUrl = process.env.NEXT_PUBLIC_VTON_API_URL || 'https://v7lif3hwz72hlo-8000.proxy.runpod.net/try-on';
                    console.warn(`[RunPod] Server keys missing. Falling back to direct proxy HTTP call: ${fallbackUrl}`);
                    setStatusMessage("Using proxy endpoint fallback...");

                    const proxyResponse = await fetch(fallbackUrl, {
                        method: 'POST',
                        body: formData,
                    });

                    if (!proxyResponse.ok) {
                        const proxyError = await proxyResponse.json();
                        throw new Error(proxyError.detail || "Proxy Server Error");
                    }

                    const proxyData = await proxyResponse.json();
                    if (proxyData.image) {
                        setImagePreview(proxyData.image);
                        setViewMode('generated');
                        setState('RESULT');
                        return;
                    } else {
                        throw new Error("No image returned from proxy");
                    }
                }

                throw new Error(errorData.error || "Server Error");
            }

            const data = await apiResponse.json();

            // Check if job is submitted as a RunPod serverless job requiring polling
            if (data.jobId) {
                const jobId = data.jobId;
                let jobStatus = data.status || 'IN_QUEUE';
                setStatusMessage(`Job created (ID: ${jobId}). Waiting for worker...`);

                const pollInterval = 3000; // Poll every 3 seconds
                const maxPollAttempts = 40; // ~2 minutes timeout
                let attempts = 0;

                while (attempts < maxPollAttempts) {
                    attempts++;
                    await new Promise(resolve => setTimeout(resolve, pollInterval));

                    // Query our secure status API route
                    const statusResponse = await fetch(`/api/try-on/status?jobId=${jobId}`);
                    if (!statusResponse.ok) {
                        const statusError = await statusResponse.json();
                        throw new Error(statusError.error || "Failed to retrieve job status");
                    }

                    const statusData = await statusResponse.json();
                    jobStatus = statusData.status;
                    
                    setStatusMessage(`Job status: ${jobStatus.replace('_', ' ')} (Attempt ${attempts})...`);

                    if (jobStatus === 'COMPLETED') {
                        const output = statusData.output;
                        let outputImage = '';

                        // Retrieve the image from RunPod output (handles string, array, or nested object)
                        if (typeof output === 'string') {
                            outputImage = output;
                        } else if (Array.isArray(output) && output.length > 0) {
                            outputImage = output[0];
                        } else if (output && typeof output === 'object') {
                            outputImage = output.image || output.img || output.url || '';
                        }

                        if (!outputImage) {
                            throw new Error("RunPod job completed but returned no output image");
                        }

                        // Attach base64 prefix if missing
                        if (outputImage.startsWith('iVBORw0KGgo')) {
                            outputImage = `data:image/png;base64,${outputImage}`;
                        }

                        setImagePreview(outputImage);
                        setViewMode('generated');
                        setState('RESULT');
                        return; // Successfully completed!
                    }

                    if (jobStatus === 'FAILED' || jobStatus === 'CANCELLED') {
                        throw new Error(statusData.error || `RunPod job failed with status: ${jobStatus}`);
                    }
                }

                throw new Error("Try-On generation timed out. Please try again.");
            } else if (data.image) {
                // If route returned image directly (synchronous)
                setImagePreview(data.image);
                setViewMode('generated');
                setState('RESULT');
            } else {
                throw new Error("No jobId or output image received from server");
            }
        } catch (error) {
            console.error("Try-On Error", error);
            alert(`Try-On failed: ${error instanceof Error ? error.message : "Unknown error"}`);
            setState('UPLOAD');
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <X size={20} />
                </button>

                {state === 'UPLOAD' && (
                    <div className={styles.uploadContainer}>
                        <h2 className={styles.title}>Virtual Tryon</h2>

                        {/* Training Image Section */}
                        <div className={styles.sectionHeader}>Upload Image</div>
                        <div
                            className={styles.uploadArea}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <button className={styles.uploadBtnSecondary}>
                                <Upload size={16} /> Upload image
                            </button>
                            <p className={styles.uploadText}>
                                Drag and drop file here or upload here<br />
                                <span className={styles.uploadSubtext}>Size should not exceed 20MB, and GIF format is not supported</span>
                            </p>
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            className={styles.fileInput}
                            onChange={handleFileChange}
                        />

                        {/* Category Selector */}
                        <div className={styles.categorySelectorContainer} style={{ marginBottom: '1rem', marginTop: '1rem' }}>
                            <label className={styles.sectionHeader} style={{ display: 'block', marginBottom: '0.5rem' }}>Garment Category</label>
                            <div className={styles.categoryButtons} style={{ display: 'flex', gap: '0.5rem' }}>
                                {(['tops', 'bottoms', 'one-pieces'] as Category[]).map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '20px',
                                            border: '1px solid #ccc',
                                            background: selectedCategory === cat ? '#000' : '#fff',
                                            color: selectedCategory === cat ? '#fff' : '#000',
                                            cursor: 'pointer',
                                            textTransform: 'capitalize',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        {cat.replace('-', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Image Examples Section */}
                        <div className={styles.examplesHeaderRow}>
                            <div className={styles.sectionHeader} style={{ marginBottom: 0 }}>Image Examples</div>
                            <span className={styles.purpleLink}>Following these requirements for optimal results</span>
                        </div>

                        <div className={styles.newExamplesGrid}>
                            {/* Correct Examples Block */}
                            <div className={styles.exampleBlock}>
                                <div className={styles.thumbsRow}>
                                    <div className={styles.thumbWrapper}>
                                        <Image src="/examples/correct-1.png" alt="Correct 1" fill className={styles.thumbImg} />
                                        <div className={styles.checkBadge}>✓</div>
                                    </div>
                                    <div className={styles.thumbWrapper}>
                                        <Image src="/examples/correct-2.png" alt="Correct 2" fill className={styles.thumbImg} />
                                        <div className={styles.checkBadge}>✓</div>
                                    </div>
                                    <div className={styles.thumbWrapper}>
                                        <Image src="/examples/correct-3.png" alt="Correct 3" fill className={styles.thumbImg} />
                                        <div className={styles.checkBadge}>✓</div>
                                    </div>
                                </div>
                                <div className={styles.exampleCaption}>
                                    <strong>Correct examples</strong>
                                    <p>Front-facing, evenly lit, full-body or half-body shot</p>
                                </div>
                            </div>

                            {/* Incorrect Examples Block */}
                            <div className={styles.exampleBlock}>
                                <div className={styles.thumbsRow}>
                                    <div className={styles.thumbWrapper}>
                                        <Image src="/examples/incorrect-1.png" alt="Incorrect 1" fill className={styles.thumbImg} />
                                        <div className={styles.crossBadge}>✕</div>
                                    </div>
                                    <div className={styles.thumbWrapper}>
                                        <Image src="/examples/incorrect-2.png" alt="Incorrect 2" fill className={styles.thumbImg} />
                                        <div className={styles.crossBadge}>✕</div>
                                    </div>
                                    <div className={styles.thumbWrapper}>
                                        <Image src="/examples/incorrect-3.png" alt="Incorrect 3" fill className={styles.thumbImg} />
                                        <div className={styles.crossBadge}>✕</div>
                                    </div>
                                </div>
                                <div className={styles.exampleCaption}>
                                    <strong>Incorrect examples</strong>
                                    <p>Close-up shots, incomplete face display, clothing covering the face, overly complex background</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Terms */}
                        <button className={styles.confirmBtn} onClick={() => fileInputRef.current?.click()}>
                            Confirm
                        </button>
                    </div>
                )}

                {state === 'SCANNING' && sourceImage && (
                    <div className={styles.scanningContainer}>
                        <div className={styles.previewImageWrapper}>
                            <img src={sourceImage} alt="Scanning" className={styles.previewImage} />
                            <div className={styles.scanLine}></div>
                        </div>
                        <div className={styles.scanStatus}>
                            <div className={styles.loadingSpinner}></div>
                            <span className={styles.statusText}>{statusMessage}</span>
                        </div>
                    </div>
                )}

                {state === 'RESULT' && (
                    <div className={styles.resultContainer}>
                        <div className={styles.toggleContainer}>
                            <button
                                className={`${styles.toggleBtn} ${viewMode === 'original' ? styles.active : ''}`}
                                onClick={() => setViewMode('original')}
                            >
                                Original
                            </button>
                            <button
                                className={`${styles.toggleBtn} ${viewMode === 'generated' ? styles.active : ''}`}
                                onClick={() => setViewMode('generated')}
                            >
                                Generated
                            </button>
                        </div>

                        <div className={styles.previewImageWrapper}>
                            {/* Show based on toggle */}
                            {viewMode === 'original' && sourceImage ? (
                                <Image src={sourceImage} alt="Original" fill style={{ objectFit: 'cover' }} />
                            ) : imagePreview ? (
                                <Image src={imagePreview} alt="Generated Result" fill style={{ objectFit: 'cover' }} />
                            ) : (
                                <div className={styles.loadingSpinner}></div>
                            )}
                        </div>

                        <div className={styles.resultActions}>
                            <button className={`${styles.actionBtn} ${styles.retryBtn}`} onClick={() => setState('UPLOAD')}>
                                Try Another
                            </button>
                            <button className={styles.actionBtn} onClick={onClose}>
                                <CheckCircle size={20} />
                                Save
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TryOnModal;
