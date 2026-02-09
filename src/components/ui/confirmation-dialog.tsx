import Swal, { SweetAlertIcon, SweetAlertOptions } from 'sweetalert2';

interface ConfirmationDialogOptions {
  title: string;
  text?: string;
  icon?: SweetAlertIcon;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonColor?: string;
  cancelButtonColor?: string;
  showCancelButton?: boolean;
  customOptions?: SweetAlertOptions;
}

/**
 * Reusable confirmation dialog component using SweetAlert2
 *
 * @example
 * // Basic usage
 * const result = await showConfirmationDialog({
 *   title: 'Are you sure?',
 *   text: 'This action cannot be undone',
 * });
 *
 * if (result.isConfirmed) {
 *   // Perform action
 * }
 *
 * @example
 * // Custom styling
 * const result = await showConfirmationDialog({
 *   title: 'Delete Item?',
 *   text: 'This will permanently delete the item',
 *   icon: 'warning',
 *   confirmButtonText: 'Yes, delete it!',
 *   confirmButtonColor: '#ef4444',
 * });
 */
export const showConfirmationDialog = async (options: ConfirmationDialogOptions) => {
  const {
    title,
    text,
    icon = 'warning',
    confirmButtonText = 'Yes, proceed!',
    cancelButtonText = 'Cancel',
    confirmButtonColor = '#3085d6',
    cancelButtonColor = '#d33',
    showCancelButton = true,
    customOptions = {},
  } = options;

  return await Swal.fire({
    title,
    text,
    icon,
    showCancelButton,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor,
    cancelButtonColor,
    reverseButtons: true,
    ...customOptions,
  });
};

/**
 * Shows a simple alert dialog (no cancel button)
 */
export const showAlertDialog = async (options: Omit<ConfirmationDialogOptions, 'showCancelButton'>) => {
  const {
    title,
    text,
    icon = 'info',
    confirmButtonText = 'OK',
    confirmButtonColor = '#3085d6',
    customOptions = {},
  } = options;

  return await Swal.fire({
    title,
    text,
    icon,
    confirmButtonText,
    confirmButtonColor,
    ...customOptions,
  });
};

/**
 * Shows a success message
 */
export const showSuccessDialog = async (title: string, text?: string) => {
  return await showAlertDialog({
    title,
    text,
    icon: 'success',
    confirmButtonText: 'Great!',
    confirmButtonColor: '#10b981',
  });
};

/**
 * Shows an error message
 */
export const showErrorDialog = async (title: string, text?: string) => {
  return await showAlertDialog({
    title,
    text,
    icon: 'error',
    confirmButtonText: 'OK',
    confirmButtonColor: '#ef4444',
  });
};

/**
 * Shows a warning that cannot be dismissed (no cancel option)
 */
export const showWarningDialog = async (title: string, text?: string) => {
  return await showAlertDialog({
    title,
    text,
    icon: 'warning',
    confirmButtonText: 'OK',
    confirmButtonColor: '#f59e0b',
  });
};
