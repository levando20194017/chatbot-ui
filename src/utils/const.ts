export const rag_token = "rag_token";
export const rag_user = "rag_user";

export const status = {
  SUCCESS: "200",
};

export const getUserStorage = () => {
  if (typeof window !== "undefined") {
    return JSON.parse(localStorage.getItem(rag_user) || "{}");
  }
  return {};
};
