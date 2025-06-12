import { Book, MessageCircle } from "lucide-react";

export const features = [
  {
    title: "TỪ ĐIỂN",
    englishTitle: "Tra cứu thông minh",
    description:
      "Truy cập định nghĩa từ, thành ngữ và cụm động từ với ngữ cảnh của từ.",
    icon: Book,
    href: "/dictionary",
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    title: "TƯ VẤN",
    englishTitle: "Trò chuyện với gia sư ảo",
    description:
      "Tương tác với gia sư AI để được hướng dẫn và hỗ trợ tự học tiếng Anh.",
    icon: MessageCircle,
    href: "/chat",
    gradient: "from-orange-500 to-amber-400",
  },
];
