// src/views/helpView.js
import { renderTemplate } from "../core/templates.js";

const appEl = document.getElementById("app");

export async function renderHelp() {
  // FAQ data
  const faqs = [
    {
      question: "Làm thế nào để đặt bàn tại nhà hàng?",
      answer: "Để đặt bàn, bạn chỉ cần chọn nhà hàng mong muốn từ danh sách, nhấn vào nút 'Đặt bàn', chọn ngày giờ và số lượng khách, sau đó hoàn tất thanh toán. Bạn sẽ nhận được xác nhận đặt bàn qua thông báo."
    },
    {
      question: "Tôi có thể hủy hoặc thay đổi đặt bàn không?",
      answer: "Có, bạn có thể hủy hoặc chỉnh sửa đặt bàn của mình trong mục 'Đặt bàn' trước thời gian đặt bàn ít nhất 2 giờ. Sau thời gian này, bạn cần liên hệ trực tiếp với nhà hàng để thay đổi."
    },
    {
      question: "Phương thức thanh toán nào được chấp nhận?",
      answer: "Chúng tôi chấp nhận nhiều phương thức thanh toán bao gồm: thẻ tín dụng/ghi nợ (Visa, Mastercard), ví điện tử (Momo, ZaloPay, VNPay), và chuyển khoản ngân hàng. Bạn cũng có thể thanh toán trực tiếp tại nhà hàng."
    },
    {
      question: "Làm sao để viết đánh giá cho nhà hàng?",
      answer: "Sau khi check-in tại nhà hàng, bạn có thể viết đánh giá bằng cách vào mục 'Lịch sử' và chọn 'Viết đánh giá' cho booking đã hoàn thành. Đánh giá của bạn sẽ giúp những khách hàng khác có thêm thông tin hữu ích."
    },
    {
      question: "Tôi có bị tính phí khi đặt bàn không?",
      answer: "Việc đặt bàn qua DineLink hoàn toàn miễn phí. Bạn chỉ cần thanh toán tiền cọc (nếu có) theo yêu cầu của nhà hàng. Phí cọc sẽ được trừ vào hóa đơn khi bạn dùng bữa tại nhà hàng."
    },
    {
      question: "Check-in tại nhà hàng như thế nào?",
      answer: "Khi đến nhà hàng, bạn vào mục 'Đặt bàn', chọn booking của mình và nhấn nút 'Check-in'. Sau đó, nhân viên nhà hàng sẽ xác nhận và dẫn bạn đến bàn đã đặt. Hoặc bạn có thể cho nhân viên xem mã QR trong booking."
    },
    {
      question: "Làm thế nào để lưu nhà hàng yêu thích?",
      answer: "Bạn chỉ cần nhấn vào biểu tượng trái tim ở trang chi tiết nhà hàng hoặc trong danh sách nhà hàng. Các nhà hàng yêu thích của bạn sẽ được lưu trong mục 'Yêu thích' để dễ dàng truy cập sau này."
    },
    {
      question: "Tôi quên mật khẩu, phải làm sao?",
      answer: "Bạn có thể đặt lại mật khẩu bằng cách nhấn vào 'Quên mật khẩu' ở màn hình đăng nhập. Nhập email đã đăng ký và làm theo hướng dẫn trong email để tạo mật khẩu mới."
    },
    {
      question: "Ứng dụng có hỗ trợ đặt bàn nhóm lớn không?",
      answer: "Có, chúng tôi hỗ trợ đặt bàn cho nhóm lớn (trên 10 người). Tuy nhiên, để đảm bảo chất lượng phục vụ, chúng tôi khuyến khích bạn đặt trước ít nhất 1-2 ngày và có thể cần liên hệ trực tiếp với nhà hàng."
    },
    {
      question: "Thông tin cá nhân của tôi có được bảo mật không?",
      answer: "Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn theo chính sách bảo mật nghiêm ngặt. Mọi thông tin thanh toán đều được mã hóa và chúng tôi không chia sẻ dữ liệu của bạn với bên thứ ba mà không có sự đồng ý."
    }
  ];

  const contentHtml = renderTemplate("help", { faqs });
  appEl.innerHTML = contentHtml;

  // Initialize event listeners
  initHelpEventListeners();
}

function initHelpEventListeners() {
  // Back button
  const backBtn = document.getElementById("backBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.history.back();
    });
  }

  // FAQ accordion
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    if (question) {
      question.addEventListener("click", () => {
        // Close other items
        faqItems.forEach((otherItem) => {
          if (otherItem !== item && otherItem.classList.contains("active")) {
            otherItem.classList.remove("active");
          }
        });

        // Toggle current item
        item.classList.toggle("active");

        // Vibrate if supported
        if (navigator.vibrate) {
          navigator.vibrate(10);
        }
      });
    }
  });
}
