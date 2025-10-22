import { ref, h, render } from "vue";
import KinesisAlert from "../components/KinesisAlert.vue";

// Global alert instance
let alertInstance = null;
let alertContainer = null;

/**
 * Kinesis Alert Composable
 *
 * Usage:
 * const { showAlert } = useKinesisAlert()
 *
 * showAlert({
 *   type: 'success',
 *   title: 'Success',
 *   japaneseTitle: '成功',
 *   message: 'Your action was successful!',
 *   confirmText: 'OK',
 *   autoClose: 3000
 * })
 */

export const useKinesisAlert = () => {
  const createAlertInstance = () => {
    if (!alertContainer) {
      alertContainer = document.createElement("div");
      document.body.appendChild(alertContainer);
    }
  };

  const destroyAlertInstance = () => {
    if (alertContainer) {
      render(null, alertContainer);
      document.body.removeChild(alertContainer);
      alertContainer = null;
      alertInstance = null;
    }
  };

  const showAlert = (options = {}) => {
    return new Promise((resolve, reject) => {
      createAlertInstance();

      const {
        type = "info",
        title = "Notice",
        japaneseTitle = "",
        message = "",
        confirmText = "OK",
        cancelText = "",
        autoClose = 0,
      } = options;

      const vnode = h(KinesisAlert, {
        type,
        title,
        japaneseTitle,
        message,
        confirmText,
        cancelText,
        autoClose,
        onConfirm: () => {
          resolve(true);
          setTimeout(destroyAlertInstance, 300);
        },
        onCancel: () => {
          resolve(false);
          setTimeout(destroyAlertInstance, 300);
        },
        onClose: () => {
          setTimeout(destroyAlertInstance, 300);
        },
      });

      render(vnode, alertContainer);
      alertInstance = vnode.component;

      // Show alert after next tick
      setTimeout(() => {
        if (alertInstance?.exposed) {
          alertInstance.exposed.show();
        }
      }, 50);
    });
  };

  // Convenience methods
  const success = (message, title = "Success", japaneseTitle = "成功") => {
    return showAlert({
      type: "success",
      title,
      japaneseTitle,
      message,
      confirmText: "OK",
      autoClose: 3000,
    });
  };

  const error = (message, title = "Error", japaneseTitle = "エラー") => {
    return showAlert({
      type: "error",
      title,
      japaneseTitle,
      message,
      confirmText: "OK",
    });
  };

  const warning = (message, title = "Warning", japaneseTitle = "警告") => {
    return showAlert({
      type: "warning",
      title,
      japaneseTitle,
      message,
      confirmText: "OK",
    });
  };

  const info = (message, title = "Information", japaneseTitle = "情報") => {
    return showAlert({
      type: "info",
      title,
      japaneseTitle,
      message,
      confirmText: "OK",
    });
  };

  const confirm = (message, title = "Confirm", japaneseTitle = "確認") => {
    return showAlert({
      type: "confirm",
      title,
      japaneseTitle,
      message,
      confirmText: "Confirm",
      cancelText: "Cancel",
    });
  };

  return {
    showAlert,
    success,
    error,
    warning,
    info,
    confirm,
  };
};
