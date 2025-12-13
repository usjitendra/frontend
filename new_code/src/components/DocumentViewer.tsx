"use client";

import { useState, useEffect } from "react";
import {
    FileText,
    Loader2,
    X,
    Maximize2,
    ExternalLink,
    Download,
    File,
    FileText as FileWord,
    FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DocumentViewerProps {
    isOpen: boolean;
    onClose: () => void;
    document: {
        id?: string | number;
        name?: string;
        url?: string;
        mimetype?: string;
        bytes?: number;
    } | null;
    className?: string;
    maxWidth?: string;
    height?: string;
}

const DocumentViewer = ({ 
    isOpen, 
    onClose, 
    document, 
    className = "",
    maxWidth = "max-w-5xl",
    height = "h-[80vh]"
}: DocumentViewerProps) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isIframeLoading, setIsIframeLoading] = useState(true);
    const [useDirectUrl, setUseDirectUrl] = useState(false);

    // Reset states when dialog opens/closes
    useEffect(() => {
        if (isOpen) {
            setIsFullscreen(false);
            setIsIframeLoading(true);
            setUseDirectUrl(false);
        }
    }, [isOpen]);

    // Reset states when document changes
    useEffect(() => {
        if (document) {
            setIsIframeLoading(true);
            setUseDirectUrl(false);
        }
    }, [document?.id, document?.url]);

    const getFileIcon = (mimetype?: string) => {
        if (mimetype?.includes('pdf')) {
            return <File className="h-4 w-4 text-red-600" />;
        } else if (mimetype?.includes('word') || mimetype?.includes('docx')) {
            return <FileWord className="h-4 w-4 text-blue-600" />;
        } else if (mimetype?.includes('sheet') || mimetype?.includes('excel') || mimetype?.includes('xlsx') || mimetype?.includes('csv')) {
            return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
        } else {
            return <FileText className="h-4 w-4 text-purple-600" />;
        }
    };

    const getFileIconBg = (mimetype?: string) => {
        if (mimetype?.includes('pdf')) {
            return "bg-red-100";
        } else if (mimetype?.includes('word') || mimetype?.includes('docx')) {
            return "bg-blue-100";
        } else if (mimetype?.includes('sheet') || mimetype?.includes('excel') || mimetype?.includes('xlsx') || mimetype?.includes('csv')) {
            return "bg-green-100";
        } else {
            return "bg-purple-100";
        }
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return "Unknown size";
        if (bytes < 1024) return bytes + " B";
        else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
        else return (bytes / 1048576).toFixed(2) + " MB";
    };

    // Function to get the appropriate viewer URL for different file types
    const getViewerUrl = (document: any) => {
        if (!document?.url) return null;
        
        const isPdf = document.mimetype?.includes('pdf');
        const isGoogleDoc = document.mimetype?.includes('word') || document.mimetype?.includes('docx') || 
                           document.mimetype?.includes('sheet') || document.mimetype?.includes('excel') || 
                           document.mimetype?.includes('xlsx') || document.mimetype?.includes('powerpoint') || 
                           document.mimetype?.includes('pptx');
        
        // For PDFs, try Google Docs viewer first to avoid Chrome blocking
        if (isPdf) {
            return `https://docs.google.com/viewer?url=${encodeURIComponent(document.url)}&embedded=true`;
        }
        
        // For Google Docs compatible files, use Google Docs viewer
        if (isGoogleDoc) {
            return `https://docs.google.com/viewer?url=${encodeURIComponent(document.url)}&embedded=true`;
        }
        
        // For other files, try direct embedding
        return document.url;
    };

    const handleCloseDocumentViewer = () => {
        setIsFullscreen(false);
        setIsIframeLoading(true);
        setUseDirectUrl(false);
        onClose();
    };

    const handleIframeLoad = () => {
        setIsIframeLoading(false);
    };

    const handleIframeError = () => {
        setIsIframeLoading(false);
        // If Google Docs viewer fails, try direct URL as fallback
        if (!useDirectUrl && document) {
            setUseDirectUrl(true);
            setIsIframeLoading(true);
        }
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const handleDownload = () => {
        if (document?.url) {
            const link = window.document.createElement('a');
            link.href = document.url;
            link.download = document.name || 'document';
            link.click();
        }
    };

    const handleOpenInNewTab = () => {
        if (document?.url) {
            window.open(document.url, '_blank');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleCloseDocumentViewer}>
            <DialogContent 
                className={`${
                    isFullscreen 
                        ? 'max-w-screen max-h-screen w-screen h-screen p-0 m-0' 
                        : `${maxWidth} w-[90vw] ${height} p-0`
                } transition-all duration-200 ${className}`}
            >
                <DialogHeader className="p-4 border-b bg-white rounded-t-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {document && (
                                <>
                                    <div className={`w-8 h-8 ${getFileIconBg(document?.mimetype)} rounded-lg flex items-center justify-center`}>
                                        {getFileIcon(document?.mimetype)}
                                    </div>
                                    <div>
                                        <DialogTitle className="text-lg font-semibold text-gray-900">
                                            {document?.name || 'Document'}
                                        </DialogTitle>
                                        <p className="text-sm text-gray-500">
                                            {document?.mimetype?.split('/')[1]?.toUpperCase() || 'Unknown'} • {formatFileSize(document?.bytes)}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleFullscreen}
                                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                                className="h-8 w-8 mr-10"
                            >
                                <Maximize2 className="h-4 w-4" />
                            </Button>
                            {/* <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleOpenInNewTab}
                                title="Open in new tab"
                                className="h-8 w-8"
                            >
                                <ExternalLink className="h-4 w-4" />
                            </Button> */}                          
                        </div>
                    </div>
                </DialogHeader>
                
                <div className="flex-1 bg-gray-100 relative">
                    {document?.url && (
                        <iframe
                            key={`${document.id}-${useDirectUrl}`} // Force re-render when switching URLs
                            src={useDirectUrl ? document.url : getViewerUrl(document)}
                            className="w-full h-full border-0"
                            style={{ 
                                height: isFullscreen ? 'calc(100vh - 80px)' : 'calc(80vh - 80px)',
                                minHeight: '400px'
                            }}
                            title={`Document viewer: ${document?.name || 'Document'}`}
                            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                            loading="lazy"
                            onLoad={handleIframeLoad}
                            onError={handleIframeError}
                        />
                    )}
                    
                    {/* Loading overlay - only show when iframe is loading */}
                    {isIframeLoading && (
                        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center pointer-events-none">
                            <div className="flex flex-col items-center gap-3 text-gray-600">
                                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                                <p className="text-sm font-medium">
                                    {useDirectUrl ? 'Loading document (fallback)...' : 'Loading document...'}
                                </p>
                                <p className="text-xs text-gray-500">This may take a few moments</p>
                            </div>
                        </div>
                    )}

                    {/* Error state - show if no document URL */}
                    {!document?.url && !isIframeLoading && (
                        <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-4 text-gray-500">
                                <FileText className="h-12 w-12" />
                                <p className="text-sm font-medium">Unable to load document</p>
                                <p className="text-xs text-center">The document URL is not available</p>
                            </div>
                        </div>
                    )}

                    {/* Fallback options - show if document fails to load in iframe */}
                    {document?.url && !isIframeLoading && useDirectUrl && (
                        <div className="absolute top-4 right-4 z-10">
                            <div className="bg-white rounded-lg shadow-lg p-3 border">
                                <p className="text-xs text-gray-600 mb-2">Having trouble viewing?</p>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleOpenInNewTab}
                                        className="text-xs"
                                    >
                                        <ExternalLink className="h-3 w-3 mr-1" />
                                        Open in New Tab
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleDownload}
                                        className="text-xs"
                                    >
                                        <Download className="h-3 w-3 mr-1" />
                                        Download
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DocumentViewer; 