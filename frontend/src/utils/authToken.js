// Hàm lưu token vào cookies
export const saveAuthToken = (data) => {
    document.cookie = `authToken=${encodeURIComponent(JSON.stringify(data))}; path=/; max-age=86400; Secure; SameSite=Strict`;
};

// Hàm lấy token từ cookies
export const getAuthToken = () => {
    try {
        const cookies = document.cookie.split("; ");
        for (let cookie of cookies) {
            let [name, value] = cookie.split("=");
            if (name === "authToken") {
                const decoded = decodeURIComponent(value);
                return JSON.parse(decoded);
            }
        }
        return null;
    } catch (error) {
        console.error("❌ Lỗi khi lấy hoặc parse token:", error);
        return null;
    }
};

// Hàm xóa token khỏi cookies
export const removeAuthToken = () => {
    document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; Secure; SameSite=Strict";
};
