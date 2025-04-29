import { X } from 'lucide-react';
interface SnackbarProps {
  message: string;
  onUndo?: () => void;
  onClose: () => void;
}

export function Snackbar({ message, onUndo, onClose }: SnackbarProps) {
  return (
    <div className="fixed bg-(--color-primary) bottom-4 left-1/2 transform -translate-x-1/2 text-white px-4 py-2 rounded-lg flex items-center gap-4 shadow-lg">
      <span>{message}</span>
      {onUndo && (
        <button onClick={onUndo} className="underline text-sm">Annuler</button>
      )}
      <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer">
        <X size={16} />
      </button>
    </div>
  );
}
