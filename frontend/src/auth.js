export const saveAuthToken = (token) => {
    if (window.electronAPI) {
        window.electronAPI.saveAuthToken(token);
    } else {
        console.error("Electron API không tồn tại trên window.");
    }
};

export const getAuthToken = async () => {
    if (window.electronAPI) {
        return await window.electronAPI.getAuthToken();
    } else {
        console.error("Electron API không tồn tại trên window.");
        return null;
    }
};

export const logOut = () => {
    window.electronAPI.logOut();
};