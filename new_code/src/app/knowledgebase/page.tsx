"use client";

import { useEffect, useState } from "react";
import {
    FileText,
    CheckCircle,
    Clock,
    Database,
    File,
    FileText as FileWord,
    FileSpreadsheet,
    Trash,
    Loader2,
    Eye
} from "lucide-react";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import UploadDocumentPopUp from "@/components/UploadDocumentPopUp";
import DocumentViewer from "@/components/DocumentViewer";
import { getDocumentListApi, deleteDocumentApi } from "@/network/Api";
import DeleteAlert from "@/components/DeleteAlert";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const KnowledgeBasePage = () => {
    const [sortBy, setSortBy] = useState("date");
    const [isUploadPopupOpen, setIsUploadPopupOpen] = useState(false);
    const [documentList, setDocumentList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedDocumentId, setSelectedDocumentId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    // Document viewer modal state
    const [isDocumentViewerOpen, setIsDocumentViewerOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<any>(null);

    const fetchDocumentList = () => {
        setIsLoading(true);
        getDocumentListApi().then((res) => {
            if (res.data) {
                console.log("res.data", res.data?.data?.files);
                setDocumentList(res.data?.data?.files);
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

    useEffect(() => {
        fetchDocumentList();
    }, []);

    const getFileIcon = (mimetype: any) => {
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

    const getFileIconBg = (mimetype: any) => {
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

    const formatFileSize = (bytes: any) => {
        if (bytes < 1024) return bytes + " B";
        else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
        else return (bytes / 1048576).toFixed(2) + " MB";
    };

    const formatDate = (dateString: any) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

        if (diffDays > 0) {
            return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
        } else if (diffHours > 0) {
            return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
        } else {
            const diffMinutes = Math.floor(diffTime / (1000 * 60));
            return diffMinutes === 1 ? "1 minute ago" : `${diffMinutes} minutes ago`;
        }
    };

    const handleDeleteDocument = (id: any) => {
        setSelectedDocumentId(id);
        setShowDeleteDialog(true);
    }

    const handleConfirmDelete = () => {
        if (selectedDocumentId) {
            setIsDeleting(true);
            deleteDocumentApi(selectedDocumentId).then((res) => {
                if(res.data){
                    toast({
                        title: "Document deleted successfully",
                        description: "The document has been removed from your knowledge base",
                    });
                    fetchDocumentList();
                }
            }).catch((err) => {
                console.log(err);
                toast({
                    title: "Error deleting document",
                    description: "There was a problem deleting the document",
                    variant: "destructive",
                });
            }).finally(() => {
                setIsDeleting(false);
                setShowDeleteDialog(false);
            });
        }
    }

    // Function to handle document viewing
    const handleViewDocument = (document: any) => {
        setSelectedDocument(document);
        setIsDocumentViewerOpen(true);
    };

    const handleCloseDocumentViewer = () => {
        setIsDocumentViewerOpen(false);
        setSelectedDocument(null);
    };

    return (
        <div id="main-content" className="flex-1 overflow-auto">
            {/* Header */}
            <div className="w-full flex items-center justify-between p-4 border-b">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Knowledge Base</h2>
                    <p className="text-sm text-gray-500 mt-1">Upload and manage your documents for AI processing</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Input
                            type="text"
                            placeholder="Search documents..."
                            className="pl-10 pr-4 py-2.5 bg-gray-50 text-sm rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                        <FileText className="absolute left-3.5 top-3 text-gray-400 h-4 w-4" />
                    </div>
                    <Button
                        className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-indigo-800 shadow-sm"
                        onClick={() => setIsUploadPopupOpen(true)}
                    >
                        <FileText className="h-4 w-4 mr-2" />
                        Upload Document
                    </Button>
                </div>
            </div>

            {/* Document Stats */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-gray-100">
                <Card className="shadow-sm">
                    <CardContent className="pt-4 pb-3 px-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FileText className="text-blue-600 h-5 w-5" />
                            </div>
                            <span className="text-xs font-medium text-blue-600">Documents</span>
                        </div>
                        {isLoading ? (
                            <Skeleton className="h-6 w-16 mb-1" />
                        ) : (
                            <h3 className="text-xl font-bold text-gray-900">{documentList.length || 0}</h3>
                        )}
                        <p className="text-xs text-gray-500 mt-0.5">Total documents</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardContent className="pt-4 pb-3 px-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="text-green-600 h-5 w-5" />
                            </div>
                            <span className="text-xs font-medium text-green-600">Processed</span>
                        </div>
                        {isLoading ? (
                            <Skeleton className="h-6 w-16 mb-1" />
                        ) : (
                            <h3 className="text-xl font-bold text-gray-900">
                                {documentList.filter((doc: any) => doc.status === 'done').length || 0}
                            </h3>
                        )}
                        <p className="text-xs text-gray-500 mt-0.5">AI processed</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardContent className="pt-4 pb-3 px-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Clock className="text-orange-600 h-5 w-5" />
                            </div>
                            <span className="text-xs font-medium text-orange-600">Pending</span>
                        </div>
                        {isLoading ? (
                            <Skeleton className="h-6 w-16 mb-1" />
                        ) : (
                            <h3 className="text-xl font-bold text-gray-900">
                                {documentList.filter((doc: any) => doc.status !== 'done').length || 0}
                            </h3>
                        )}
                        <p className="text-xs text-gray-500 mt-0.5">Awaiting processing</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardContent className="pt-4 pb-3 px-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Database className="text-purple-600 h-5 w-5" />
                            </div>
                            <span className="text-xs font-medium text-purple-600">Storage</span>
                        </div>
                        {isLoading ? (
                            <Skeleton className="h-6 w-16 mb-1" />
                        ) : (
                            <h3 className="text-xl font-bold text-gray-900">
                                {(documentList.reduce((total: any, doc: any) => total + (doc.bytes || 0), 0) / (1024 * 1024)).toFixed(1)} MB
                            </h3>
                        )}
                        <p className="text-xs text-gray-500 mt-0.5">of 5 GB used</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Documents */}
            <div className="p-6 bg-gray-100 h-full">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Recent Documents</h3>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Sort by:</span>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="date">Date Added</SelectItem>
                                    <SelectItem value="name">Name</SelectItem>
                                    <SelectItem value="size">Size</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>                   
                    </div>
                </div>

                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Size</TableHead>
                                <TableHead>Added</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array(5).fill(0).map((_, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Skeleton className="w-8 h-8 rounded-lg" />
                                                <Skeleton className="h-4 w-40" />
                                            </div>
                                        </TableCell>
                                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Skeleton className="h-8 w-8 rounded-full" />
                                                <Skeleton className="h-8 w-8 rounded-full" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : documentList.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-4">No documents found</TableCell>
                                </TableRow>
                            ) : (
                                documentList.map((document: any) => (
                                    <TableRow key={document.id} className="hover:bg-gray-50/50">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 ${getFileIconBg(document.mimetype)} rounded-lg flex items-center justify-center`}>
                                                    {getFileIcon(document.mimetype)}
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">{document.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-500">
                                            {document.mimetype?.split('/')[1]?.toUpperCase() || 'Unknown'}
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-500">
                                            {formatFileSize(document.bytes)}
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-500">
                                            {formatDate(document.created_at)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={`${document.status === 'done'
                                                        ? 'bg-green-100 text-green-600 hover:bg-green-100'
                                                        : 'bg-orange-100 text-orange-600 hover:bg-orange-100'
                                                    }`}
                                            >
                                                {document.status === 'done' ? 'Processed' : 'Processing'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">                                            
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8"
                                                    onClick={() => handleViewDocument(document)}
                                                    title="View document"
                                                >
                                                    <Eye className="h-4 w-4 text-blue-500" />
                                                </Button>                                                
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8"
                                                    onClick={() => handleDeleteDocument(document.id)}
                                                    title="Delete document"
                                                    disabled={isDeleting && selectedDocumentId === document.id}
                                                >
                                                    {isDeleting && selectedDocumentId === document.id ? (
                                                        <Loader2 className="h-4 w-4 text-red-500 animate-spin" />
                                                    ) : (
                                                        <Trash className="h-4 w-4 text-red-500" />
                                                    )}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>

            {/* Upload Document Popup */}
            <UploadDocumentPopUp
                isOpen={isUploadPopupOpen}
                onClose={() => {
                    setIsUploadPopupOpen(false);
                    fetchDocumentList(); // Refresh document list after upload
                }}
            />

            {/* Delete Document Alert */}
            <DeleteAlert
                isOpen={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onSuccess={() => { handleConfirmDelete() }}
            />

            {/* Document Viewer Modal */}
            <DocumentViewer
                isOpen={isDocumentViewerOpen}
                onClose={handleCloseDocumentViewer}
                document={selectedDocument}
            />
        </div>
    );
};

export default KnowledgeBasePage;