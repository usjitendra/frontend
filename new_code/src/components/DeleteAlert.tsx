"use client"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogPortal,
    AlertDialogOverlay,
} from "@/components/ui/alert-dialog"

interface DeleteProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

const DeleteAlert: React.FC<DeleteProps> = ({ isOpen, onOpenChange, onSuccess }) => {
    const handleSuccess = () => {
        onOpenChange(false);
        onSuccess();
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogPortal>
                <AlertDialogOverlay className="fixed inset-0 z-50 bg-black/50" />
                <AlertDialogContent className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-600">Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            className="bg-red-600" 
                            onClick={handleSuccess}
                        >
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogPortal>
        </AlertDialog>
    )
}

export default DeleteAlert;