
export let showFeatureNotImplementedModalCalled = false;
export let showAlertCalled = false;

export function showFeatureNotImplementedModal() {
    showFeatureNotImplementedModalCalled = true;
}

export function showAlert() {
    showAlertCalled = true;
}

export function reset() {
    showFeatureNotImplementedModalCalled = false;
    showAlertCalled = false;
}
