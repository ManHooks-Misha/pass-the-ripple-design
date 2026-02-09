import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FieldErrorMessageProps {
    message?: string | string[];
    className?: string;
}

export const FieldErrorMessage = ({ message, className }: FieldErrorMessageProps) => {
    if (!message) return null;

    const messages = Array.isArray(message) ? message : [message];

    return (
        <div className={cn("space-y-1 mt-1.5", className)}>
            {messages.map((msg, index) => (
                <p
                    key={index}
                    className="text-sm text-red-600 font-medium flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1"
                >
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{msg}</span>
                </p>
            ))}
        </div>
    );
};
