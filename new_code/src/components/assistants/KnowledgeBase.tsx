import { toast } from "@/hooks/use-toast";
import { getDocumentListApi } from "@/network/Api";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";
import DocumentViewer from "@/components/DocumentViewer";

interface DocumentFile {
    id: string;
    name: string;
    original_name: string;
    status: string;
    bytes: number;
    mimetype: string;
    url: string;
    created_at: string;
    updated_at: string;
}

const KnowledgeBase = ({initialValues, onFormDataChange}: {initialValues: any, onFormDataChange: (data: any) => void}) => {

    const [documentList, setDocumentList] = useState<DocumentFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedFiles, setSelectedFiles] = useState<string[]>(initialValues?.selectedKnowledgeBaseFiles || []);
    const [isDocumentViewerOpen, setIsDocumentViewerOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<DocumentFile | null>(null);

    console.log("initialValues", initialValues);
    

    const fetchDocumentList = () => {
        setIsLoading(true);
        getDocumentListApi().then((res) => {
            if (res.data) {
                console.log("res.data", res.data?.data?.files);
                setDocumentList(res.data?.data?.files || []);
            }
        }).catch((err) => {
            console.log(err);
            toast({
                title: "Error loading documents",
                description: "There was a problem fetching your documents",
                variant: "destructive",
            });
        }).finally(() => {
            setIsLoading(false);
        });
    }

    const handleFileSelection = (fileId: string, checked: boolean) => {
        const updatedSelection = checked 
            ? [...selectedFiles, fileId]
            : selectedFiles.filter(id => id !== fileId);
        
        setSelectedFiles(updatedSelection);
        onFormDataChange({ file_ids: updatedSelection });
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'processing':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'failed':
                return <AlertCircle className="h-4 w-4 text-red-500" />;
            default:
                return <FileText className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'processing':
                return 'bg-yellow-100 text-yellow-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleViewDocument = (document: DocumentFile) => {
        setSelectedDocument(document);
        setIsDocumentViewerOpen(true);
    };

    const handleCloseDocumentViewer = () => {
        setIsDocumentViewerOpen(false);
        setSelectedDocument(null);
    };

    useEffect(() => {
        fetchDocumentList();
    }, []);

    useEffect(() => {
        if (initialValues?.file_ids) {
            setSelectedFiles(initialValues.file_ids);
        }
    }, [initialValues]);
    
    return (
        <div className="space-y-6 p-6">

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-4">
                                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : documentList.length === 0 ? (
                <Card>
                    <CardContent className="p-6 text-center">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                        <p className="text-gray-500">Upload some documents to get started with your knowledge base.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            {selectedFiles.length} of {documentList.length} documents selected
                        </p>
                        {selectedFiles.length > 0 && (
                            <button 
                                onClick={() => {
                                    setSelectedFiles([]);
                                    onFormDataChange({ selectedKnowledgeBaseFiles: [] });
                                }}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                Clear selection
                            </button>
                        )}
                    </div>

                    {documentList.map((file) => (
                        <Card key={file.id} className={`transition-all duration-200 ${
                            selectedFiles.includes(file.id) ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
                        }`}>
                            <CardContent className="p-6">
                                <div className="flex items-start space-x-4">
                                    <Checkbox
                                        id={file.id}
                                        checked={selectedFiles.includes(file.id)}
                                        onCheckedChange={(checked) => handleFileSelection(file.id, !!checked)}
                                        className="mt-1"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <FileText className="h-5 w-5 text-gray-500" />
                                            <h3 className="text-lg font-medium text-gray-900 truncate">
                                                {file.original_name || file.name}
                                            </h3>
                                            <div className="flex items-center space-x-1">
                                                {getStatusIcon(file.status)}
                                                <Badge className={getStatusColor(file.status)}>
                                                    {file.status}
                                                </Badge>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                                            <span>{formatFileSize(file.bytes)}</span>
                                            <span>•</span>
                                            <span>{file.mimetype}</span>
                                            <span>•</span>
                                            <span>Added {formatDate(file.created_at)}</span>
                                        </div>
                                        
                                        {file.url && (
                                            <button 
                                                onClick={() => handleViewDocument(file)}
                                                className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
                                            >
                                                View document
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Document Viewer Modal */}
            <DocumentViewer
                isOpen={isDocumentViewerOpen}
                onClose={handleCloseDocumentViewer}
                document={selectedDocument}
            />
        </div>
    )
}

export default KnowledgeBase;