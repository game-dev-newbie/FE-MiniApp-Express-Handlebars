// src/data/mockData.js
// Mock data structure matching database schema

/**
 * Users data (users table)
 */
export const users = [
  {
    id: 1,
    display_name: "Nguyễn Văn A",
    email: "nguyenvana@gmail.com",
    phone: "0901234567",
    avatar_url: "https://i.pravatar.cc/150?img=1",
    created_at: "2024-01-15T08:00:00",
    updated_at: "2024-01-15T08:00:00",
  },
  {
    id: 2,
    display_name: "Trần Thị B",
    email: "tranthib@gmail.com",
    phone: "0912345678",
    avatar_url: "https://i.pravatar.cc/150?img=2",
    created_at: "2024-02-20T09:30:00",
    updated_at: "2024-02-20T09:30:00",
  },
];

/**
 * Restaurants data (restaurants table)
 */
export const restaurants = [
  {
    id: 1,
    name: "Buffet Poseidon",
    address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
    phone: "028 3822 1234",
    description:
      "Buffet hải sản cao cấp với hơn 200 món ăn tươi ngon, không gian sang trọng, view sông Sài Gòn tuyệt đẹp",
    tags: "buffet,hải sản,cao cấp,view đẹp",
    search_name: "buffet poseidon",
    search_address: "nguyen hue quan 1",
    search_tags: "buffet hai san cao cap view dep",
    require_deposit: true,
    default_deposit_amount: 100000,
    is_active: true,
    average_rating: 4.8,
    review_count: 324,
    invite_code: "POSEIDON123",
    created_at: "2023-06-01T10:00:00",
    updated_at: "2024-12-01T15:30:00",
    // Extended fields for UI
    distance: "1.2km",
    cuisine: "Buffet Hải Sản",
    priceRange: "299k - 499k",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400",
    recommended: true,
    opening_hours: "10:00",
    closing_hours: "22:00",
    menuImages: [
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600",
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600",
    ],
  },
  {
    id: 2,
    name: "Lẩu Thái Thơm Ngon",
    address: "456 Lê Lợi, Quận 1, TP.HCM",
    phone: "028 3825 5678",
    description:
      "Lẩu Thái chuẩn vị với nguyên liệu tươi mới mỗi ngày, nước lẩu đậm đà thơm ngon",
    tags: "lẩu,thái,giá rẻ,gia đình",
    search_name: "lau thai thom ngon",
    search_address: "le loi quan 1",
    search_tags: "lau thai gia re gia dinh",
    require_deposit: false,
    default_deposit_amount: 0,
    is_active: true,
    average_rating: 4.7,
    review_count: 198,
    invite_code: "LAUTHAI456",
    created_at: "2023-08-15T11:00:00",
    updated_at: "2024-11-20T14:00:00",
    distance: "800m",
    cuisine: "Lẩu Thái",
    priceRange: "150k - 250k",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400",
    recommended: true,
    opening_hours: "11:00",
    closing_hours: "23:00",
    menuImages: [
      "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600",
      "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=600",
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600",
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600",
    ],
  },
  {
    id: 3,
    name: "BBQ Premium House",
    address: "789 Pasteur, Quận 3, TP.HCM",
    phone: "028 3930 7890",
    description:
      "Nướng Hàn Quốc cao cấp, thịt hảo hạng, kimchi tự làm, sốt đặc biệt",
    tags: "nướng,hàn quốc,cao cấp,buffet nướng",
    search_name: "bbq premium house",
    search_address: "pasteur quan 3",
    search_tags: "nuong han quoc cao cap buffet nuong",
    require_deposit: true,
    default_deposit_amount: 50000,
    is_active: true,
    average_rating: 4.9,
    review_count: 567,
    invite_code: "BBQ789",
    created_at: "2023-05-10T09:30:00",
    updated_at: "2024-12-05T16:45:00",
    distance: "1.5km",
    cuisine: "Nướng Hàn Quốc",
    priceRange: "200k - 350k",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400",
    recommended: false,
    opening_hours: "17:00",
    closing_hours: "23:30",
    menuImages: [
      "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600",
      "https://images.unsplash.com/photo-1558030006-450675393462?w=600",
      "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600",
    ],
  },
  {
    id: 4,
    name: "Sushi Master",
    address: "321 Võ Văn Tần, Quận 3, TP.HCM",
    phone: "028 3823 4321",
    description:
      "Sushi Nhật Bản chính gốc, đầu bếp người Nhật, cá hồi Na Uy tươi ngon",
    tags: "sushi,nhật bản,cao cấp,sashimi",
    search_name: "sushi master",
    search_address: "vo van tan quan 3",
    search_tags: "sushi nhat ban cao cap sashimi",
    require_deposit: true,
    default_deposit_amount: 100000,
    is_active: true,
    average_rating: 4.6,
    review_count: 412,
    invite_code: "SUSHI321",
    created_at: "2023-07-20T10:15:00",
    updated_at: "2024-12-03T13:20:00",
    distance: "2km",
    cuisine: "Món Nhật",
    priceRange: "180k - 400k",
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400",
    recommended: true,
    opening_hours: "11:00",
    closing_hours: "22:00",
  },
  {
    id: 5,
    name: "Phở Hà Nội Truyền Thống",
    address: "555 Cách Mạng Tháng 8, Quận 10, TP.HCM",
    phone: "028 3865 5555",
    description:
      "Phở Hà Nội chuẩn vị 30 năm, nước dùng ninh từ xương bò 12 tiếng",
    tags: "phở,việt nam,truyền thống,giá rẻ",
    search_name: "pho ha noi truyen thong",
    search_address: "cach mang thang 8 quan 10",
    search_tags: "pho viet nam truyen thong gia re",
    require_deposit: false,
    default_deposit_amount: 0,
    is_active: true,
    average_rating: 4.9,
    review_count: 892,
    invite_code: "PHO555",
    created_at: "2023-03-01T07:00:00",
    updated_at: "2024-12-08T11:00:00",
    distance: "500m",
    cuisine: "Món Việt",
    priceRange: "50k - 100k",
    image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400",
    recommended: true,
    opening_hours: "06:00",
    closing_hours: "22:00",
  },
  {
    id: 6,
    name: "Seoul Kitchen",
    address: "888 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM",
    phone: "028 3512 8888",
    description:
      "Ẩm thực Hàn Quốc đa dạng: bibimbap, kimbap, tteokbokki, không gian trẻ trung",
    tags: "hàn quốc,bibimbap,tteokbokki,trẻ trung",
    search_name: "seoul kitchen",
    search_address: "dien bien phu binh thanh",
    search_tags: "han quoc bibimbap tteokbokki tre trung",
    require_deposit: false,
    default_deposit_amount: 0,
    is_active: true,
    average_rating: 4.8,
    review_count: 634,
    invite_code: "SEOUL888",
    created_at: "2023-09-12T12:00:00",
    updated_at: "2024-11-28T10:30:00",
    distance: "1.8km",
    cuisine: "Món Hàn",
    priceRange: "120k - 280k",
    image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=400",
    recommended: false,
    opening_hours: "10:00",
    closing_hours: "22:00",
  },
  {
    id: 7,
    name: "Chay Garden",
    address: "99 Hai Bà Trưng, Quận 1, TP.HCM",
    phone: "028 3822 9999",
    description:
      "Nhà hàng chay cao cấp, món ăn tinh tế, không gian yên tĩnh, thanh tịnh",
    tags: "chay,healthy,không gian đẹp,thanh tịnh",
    search_name: "chay garden",
    search_address: "hai ba trung quan 1",
    search_tags: "chay healthy khong gian dep thanh tinh",
    require_deposit: false,
    default_deposit_amount: 0,
    is_active: true,
    average_rating: 4.5,
    review_count: 267,
    invite_code: "CHAY99",
    created_at: "2023-10-05T08:30:00",
    updated_at: "2024-12-02T09:15:00",
    distance: "1km",
    cuisine: "Món Chay",
    priceRange: "60k - 150k",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
    recommended: true,
    opening_hours: "07:00",
    closing_hours: "21:00",
  },
  {
    id: 8,
    name: "Italian Bella",
    address: "777 Nguyễn Thị Minh Khai, Quận 3, TP.HCM",
    phone: "028 3930 7777",
    description:
      "Nhà hàng Ý chính thống, pizza lò củi, pasta tươi, rượu vang nhập khẩu",
    tags: "ý,pizza,pasta,cao cấp,rượu vang",
    search_name: "italian bella",
    search_address: "nguyen thi minh khai quan 3",
    search_tags: "y pizza pasta cao cap ruou vang",
    require_deposit: true,
    default_deposit_amount: 150000,
    is_active: true,
    average_rating: 4.7,
    review_count: 445,
    invite_code: "BELLA777",
    created_at: "2023-04-18T11:45:00",
    updated_at: "2024-12-06T14:50:00",
    distance: "2.5km",
    cuisine: "Châu Âu",
    priceRange: "200k - 500k",
    image: "https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=400",
    recommended: false,
    opening_hours: "11:00",
    closing_hours: "23:00",
  },
  {
    id: 9,
    name: "Dimsum Paradise",
    address: "234 Nam Kỳ Khởi Nghĩa, Quận 3, TP.HCM",
    phone: "028 3829 2345",
    description:
      "Dimsum Hồng Kông chuẩn vị, hơn 50 loại dimsum, trà Ô Long thượng hạng",
    tags: "dimsum,hồng kông,châu á,trà",
    search_name: "dimsum paradise",
    search_address: "nam ky khoi nghia quan 3",
    search_tags: "dimsum hong kong chau a tra",
    require_deposit: false,
    default_deposit_amount: 0,
    is_active: true,
    average_rating: 4.8,
    review_count: 521,
    invite_code: "DIM234",
    created_at: "2023-11-08T10:00:00",
    updated_at: "2024-12-07T12:30:00",
    distance: "1.3km",
    cuisine: "Châu Á",
    priceRange: "80k - 200k",
    image: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400",
    recommended: true,
    opening_hours: "08:00",
    closing_hours: "22:00",
  },
  {
    id: 10,
    name: "Nướng Việt Nam Quán",
    address: "345 Trần Hưng Đạo, Quận 1, TP.HCM",
    phone: "028 3836 3456",
    description:
      "Nướng Việt Nam đa dạng: nem nướng, ba chỉ nướng, sườn nướng, giá sinh viên",
    tags: "nướng,việt nam,giá rẻ,sinh viên",
    search_name: "nuong viet nam quan",
    search_address: "tran hung dao quan 1",
    search_tags: "nuong viet nam gia re sinh vien",
    require_deposit: false,
    default_deposit_amount: 0,
    is_active: true,
    average_rating: 4.6,
    review_count: 388,
    invite_code: "NUONG345",
    created_at: "2023-12-20T09:00:00",
    updated_at: "2024-12-04T11:20:00",
    distance: "700m",
    cuisine: "Nuướng",
    priceRange: "70k - 180k",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400",
    recommended: false,
    opening_hours: "10:00",
    closing_hours: "23:00",
  },
];

/**
 * Restaurant meal times configuration
 */
const restaurantMealTimes = {
  // Breakfast restaurants (6:00 - 10:00)
  breakfast: [5, 7], // Phở Hà Nội, Chay Garden
  // Lunch restaurants (10:00 - 14:00)
  lunch: [1, 2, 3, 4, 5, 6, 9], // Most restaurants
  // Dinner restaurants (17:00 - 22:00)
  dinner: [1, 3, 4, 6, 8, 10], // Premium restaurants
};

/**
 * Restaurant images (restaurant_images table)
 */
export const restaurantImages = [
  // Buffet Poseidon images
  {
    id: 1,
    restaurant_id: 1,
    file_path:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
    type: "GALLERY",
    caption: "Khu vực buffet hải sản",
    is_primary: true,
    created_at: "2023-06-01T10:00:00",
  },
  {
    id: 2,
    restaurant_id: 1,
    file_path:
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800",
    type: "GALLERY",
    caption: "Không gian nhà hàng",
    is_primary: false,
    created_at: "2023-06-01T10:05:00",
  },
  // Lẩu Thái images
  {
    id: 3,
    restaurant_id: 2,
    file_path:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
    type: "GALLERY",
    caption: "Lẩu Thái tôm sú",
    is_primary: true,
    created_at: "2023-08-15T11:00:00",
  },
  // Add more images for other restaurants...
];

/**
 * Restaurant tables with better structure for booking
 */
export const restaurantTablesData = {
  1: [
    // Buffet Poseidon
    {
      id: "T1-01",
      name: "Bàn 01",
      type: "standard",
      capacity: 2,
      isAvailable: true,
      image:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
    },
    {
      id: "T1-02",
      name: "Bàn 02",
      type: "standard",
      capacity: 2,
      isAvailable: true,
      image:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
    },
    {
      id: "T1-03",
      name: "Bàn 03",
      type: "standard",
      capacity: 4,
      isAvailable: true,
      image:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
    },
    {
      id: "T1-04",
      name: "Bàn 04",
      type: "standard",
      capacity: 4,
      isAvailable: true,
      image:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
    },
    {
      id: "T1-05",
      name: "Bàn 05",
      type: "standard",
      capacity: 6,
      isAvailable: false,
      image:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
    },
    {
      id: "T1-06",
      name: "Bàn 06",
      type: "standard",
      capacity: 6,
      isAvailable: true,
      image:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
    },
    {
      id: "T1-V1",
      name: "Bàn VIP 01",
      type: "vip",
      capacity: 4,
      isAvailable: true,
      image:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400",
    },
    {
      id: "T1-V2",
      name: "Bàn VIP 02",
      type: "vip",
      capacity: 6,
      isAvailable: true,
      image:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400",
    },
    {
      id: "T1-V3",
      name: "Bàn VIP 03",
      type: "vip",
      capacity: 8,
      isAvailable: true,
      image:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400",
    },
    {
      id: "T1-V4",
      name: "Bàn VIP 04",
      type: "vip",
      capacity: 10,
      isAvailable: false,
      image:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400",
    },
  ],
  2: [
    // Lẩu Thái
    {
      id: "T2-01",
      name: "Bàn 01",
      type: "standard",
      capacity: 2,
      isAvailable: true,
      image:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
    },
    {
      id: "T2-02",
      name: "Bàn 02",
      type: "standard",
      capacity: 4,
      isAvailable: true,
      image:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
    },
    {
      id: "T2-03",
      name: "Bàn 03",
      type: "standard",
      capacity: 4,
      isAvailable: true,
      image:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
    },
    {
      id: "T2-V1",
      name: "Bàn VIP 01",
      type: "vip",
      capacity: 6,
      isAvailable: true,
      image:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400",
    },
    {
      id: "T2-V2",
      name: "Bàn VIP 02",
      type: "vip",
      capacity: 8,
      isAvailable: true,
      image:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400",
    },
  ],
  3: [
    // BBQ Premium House
    {
      id: "T3-01",
      name: "Bàn 01",
      type: "standard",
      capacity: 2,
      isAvailable: true,
      image:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
    },
    {
      id: "T3-02",
      name: "Bàn 02",
      type: "standard",
      capacity: 4,
      isAvailable: true,
      image:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
    },
    {
      id: "T3-03",
      name: "Bàn 03",
      type: "standard",
      capacity: 4,
      isAvailable: true,
      image:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
    },
    {
      id: "T3-04",
      name: "Bàn 04",
      type: "standard",
      capacity: 6,
      isAvailable: true,
      image:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
    },
    {
      id: "T3-V1",
      name: "Bàn VIP 01",
      type: "vip",
      capacity: 4,
      isAvailable: true,
      image:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400",
    },
    {
      id: "T3-V2",
      name: "Bàn VIP 02",
      type: "vip",
      capacity: 6,
      isAvailable: true,
      image:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400",
    },
    {
      id: "T3-V3",
      name: "Bàn VIP 03",
      type: "vip",
      capacity: 8,
      isAvailable: true,
      image:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400",
    },
  ],
};

// Old format for compatibility
export const restaurantTables = [
  // Buffet Poseidon tables
  {
    id: 1,
    restaurant_id: 1,
    name: "Bàn VIP 01",
    capacity: 6,
    location: "Tầng 2 - View sông",
    status: "AVAILABLE",
    view_image_url:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
    view_note: "Bàn view sông Sài Gòn tuyệt đẹp",
    created_at: "2023-06-01T10:00:00",
    updated_at: "2024-12-09T08:00:00",
  },
  {
    id: 2,
    restaurant_id: 1,
    name: "Bàn A02",
    capacity: 4,
    location: "Tầng 1 - Khu A",
    status: "OCCUPIED",
    view_image_url: null,
    view_note: null,
    created_at: "2023-06-01T10:00:00",
    updated_at: "2024-12-09T10:00:00",
  },
  {
    id: 3,
    restaurant_id: 2,
    name: "Bàn 01",
    capacity: 4,
    location: "Tầng 1",
    status: "AVAILABLE",
    view_image_url: null,
    view_note: null,
    created_at: "2023-08-15T11:00:00",
    updated_at: "2024-12-09T08:00:00",
  },
];

/**
 * Bookings (bookings table)
 */
export const bookings = [
  {
    id: 1,
    restaurant_id: 1,
    table_id: 1,
    user_id: 1,
    people_count: 4,
    booking_time: "2024-12-15T19:00:00",
    status: "CONFIRMED",
    deposit_amount: 100000,
    payment_status: "PAID",
    note: "Đặt tiệc sinh nhật, cần bánh kem",
    created_at: "2024-12-08T14:30:00",
    updated_at: "2024-12-08T14:35:00",
  },
  {
    id: 2,
    restaurant_id: 2,
    table_id: 3,
    user_id: 2,
    people_count: 6,
    booking_time: "2024-12-10T18:30:00",
    status: "COMPLETED",
    deposit_amount: 0,
    payment_status: "NONE",
    note: null,
    created_at: "2024-12-07T10:00:00",
    updated_at: "2024-12-10T20:00:00",
  },
  {
    id: 3,
    restaurant_id: 3,
    table_id: null,
    user_id: 1,
    people_count: 2,
    booking_time: "2024-12-12T12:00:00",
    status: "PENDING",
    deposit_amount: 50000,
    payment_status: "PENDING",
    note: "Ngồi khu điều hòa",
    created_at: "2024-12-09T09:00:00",
    updated_at: "2024-12-09T09:00:00",
  },
];

/**
 * Reviews (reviews table)
 */
export const reviews = [
  {
    id: 1,
    booking_id: 2,
    restaurant_id: 2,
    user_id: 2,
    rating: 5,
    comment:
      "Lẩu rất ngon, nước dùng đậm đà. Nhân viên nhiệt tình. Sẽ quay lại!",
    status: "VISIBLE",
    created_at: "2024-12-11T09:00:00",
    updated_at: "2024-12-11T09:00:00",
  },
  {
    id: 2,
    booking_id: 1,
    restaurant_id: 1,
    user_id: 1,
    rating: 4,
    comment: "Buffet đa dạng, hải sản tươi. Giá hơi cao nhưng xứng đáng",
    status: "VISIBLE",
    created_at: "2024-12-16T21:00:00",
    updated_at: "2024-12-16T21:00:00",
  },
  {
    id: 3,
    booking_id: 3,
    restaurant_id: 1,
    user_id: 2,
    rating: 5,
    comment:
      "Không gian đẹp, view sông tuyệt vời. Hải sản tươi ngon, món ăn đa dạng. Nhân viên phục vụ chuyên nghiệp!",
    status: "VISIBLE",
    created_at: "2024-12-10T15:30:00",
    updated_at: "2024-12-10T15:30:00",
  },
  {
    id: 4,
    booking_id: 4,
    restaurant_id: 1,
    user_id: 1,
    rating: 4,
    comment: "Món ăn ngon, giá cả hợp lý. Chỗ đậu xe hơi xa một chút.",
    status: "VISIBLE",
    created_at: "2024-12-08T19:00:00",
    updated_at: "2024-12-08T19:00:00",
  },
  {
    id: 5,
    booking_id: 5,
    restaurant_id: 3,
    user_id: 1,
    rating: 5,
    comment:
      "Thịt nướng hảo hạng, ướp vị rất ngon. Không gian sang trọng, phù hợp cho gia đình.",
    status: "VISIBLE",
    created_at: "2024-12-09T20:30:00",
    updated_at: "2024-12-09T20:30:00",
  },
];

/**
 * Favorite restaurants (favorite_restaurants table)
 */
export const favoriteRestaurants = [
  {
    id: 1,
    user_id: 1,
    restaurant_id: 1,
    created_at: "2024-11-20T10:00:00",
  },
  {
    id: 2,
    user_id: 1,
    restaurant_id: 4,
    created_at: "2024-11-25T14:30:00",
  },
  {
    id: 3,
    user_id: 2,
    restaurant_id: 2,
    created_at: "2024-12-01T08:15:00",
  },
];

/**
 * Notifications (notifications table)
 */
export const notifications = [
  {
    id: 1,
    user_id: 1,
    restaurant_id: 1,
    type: "BOOKING_CONFIRMED",
    title: "Đặt bàn thành công",
    message:
      "Đặt bàn tại Buffet Poseidon ngày 15/12/2024 lúc 19:00 đã được xác nhận",
    channel: "IN_APP",
    is_read: true,
    read_at: "2024-12-08T15:00:00",
    created_at: "2024-12-08T14:35:00",
    sent_at: "2024-12-08T14:35:00",
  },
  {
    id: 2,
    user_id: 1,
    restaurant_id: 3,
    type: "BOOKING_REMINDER",
    title: "Nhắc nhở đặt bàn",
    message: "Bạn có lịch đặt bàn tại BBQ Premium House vào ngày mai lúc 12:00",
    channel: "IN_APP",
    is_read: false,
    read_at: null,
    created_at: "2024-12-11T10:00:00",
    sent_at: "2024-12-11T10:00:00",
  },
  {
    id: 3,
    user_id: 2,
    restaurant_id: null,
    type: "PROMOTION",
    title: "Ưu đãi cuối tuần",
    message: "Giảm 20% cho các nhà hàng buffet từ thứ 6 đến chủ nhật",
    channel: "IN_APP",
    is_read: false,
    read_at: null,
    created_at: "2024-12-09T07:00:00",
    sent_at: "2024-12-09T07:00:00",
  },
];

/**
 * Helper functions to filter and organize data
 */

// Get restaurants by category
export function getRestaurantsByCategory(category) {
  if (category === "all" || !category) {
    return restaurants;
  }

  const categoryMap = {
    buffet: ["buffet"],
    lau: ["lẩu", "lau", "thai"],
    nuong: ["nướng", "nuong", "bbq", "nướng việt nam"],
    "hai-san": ["hải sản", "hai san"],
    "mon-nhat": ["nhật", "nhat", "sushi", "sashimi"],
    "mon-viet": ["việt", "viet", "phở", "pho"],
    "mon-han": ["hàn", "han", "korean", "bibimbap", "hàn quốc"],
    "mon-chay": ["chay", "healthy"],
    "chau-a": ["châu á", "chau a", "dimsum", "asian", "hồng kông"],
    "chau-au": ["châu âu", "chau au", "ý", "italy", "pizza", "pasta"],
  };

  const keywords = categoryMap[category.toLowerCase()] || [
    category.toLowerCase(),
  ];

  return restaurants.filter((restaurant) => {
    const searchText =
      `${restaurant.search_tags} ${restaurant.search_name} ${restaurant.cuisine}`.toLowerCase();
    return keywords.some((keyword) => searchText.includes(keyword));
  });
}

// Get featured restaurants (recommended = true)
export function getFeaturedRestaurants() {
  return restaurants.filter((r) => r.recommended === true);
}

// Get popular restaurants (high rating or review count)
export function getPopularRestaurants() {
  return restaurants
    .filter((r) => r.average_rating >= 4.7 || r.review_count >= 400)
    .slice(0, 5);
}

// Get user's favorite restaurant IDs
export function getUserFavoriteIds(userId) {
  return favoriteRestaurants
    .filter((fav) => fav.user_id === userId)
    .map((fav) => fav.restaurant_id);
}

// Get unread notifications for user
export function getUnreadNotifications(userId) {
  return notifications.filter((n) => n.user_id === userId && !n.is_read);
}

// Get user's upcoming bookings
export function getUserUpcomingBookings(userId) {
  const now = new Date();
  return bookings
    .filter(
      (b) =>
        b.user_id === userId &&
        new Date(b.booking_time) > now &&
        b.status !== "CANCELLED"
    )
    .sort((a, b) => new Date(a.booking_time) - new Date(b.booking_time));
}

// Get user's recently visited restaurants (from completed bookings)
export function getRecentlyVisitedRestaurants(userId) {
  const completedBookingIds = bookings
    .filter((b) => b.user_id === userId && b.status === "COMPLETED")
    .sort((a, b) => new Date(b.booking_time) - new Date(a.booking_time))
    .slice(0, 5)
    .map((b) => b.restaurant_id);

  // Remove duplicates and get restaurant details
  const uniqueRestaurantIds = [...new Set(completedBookingIds)];
  return uniqueRestaurantIds
    .map((id) => restaurants.find((r) => r.id === id))
    .filter((r) => r !== undefined);
}

// Search restaurants
// Helper function to remove Vietnamese accents for better search
function removeVietnameseAccents(str) {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

export function searchRestaurants(searchTerm) {
  const term = removeVietnameseAccents(searchTerm);
  if (!term) return [];

  // Split search term into words for multi-word search
  const searchWords = term.split(/\s+/).filter((word) => word.length > 0);

  return restaurants.filter((restaurant) => {
    // Create searchable text from specific fields only
    const searchFields = [
      restaurant.name,
      restaurant.search_name,
      restaurant.cuisine,
      restaurant.tags,
      restaurant.search_tags,
    ];

    const searchText = searchFields
      .filter((field) => field)
      .map((field) => removeVietnameseAccents(String(field)))
      .join(" ");

    // Check if ALL search words are found in the text
    return searchWords.every((word) => searchText.includes(word));
  });
}

// Get time of day
export function getTimeOfDay() {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 10) {
    return "morning"; // Sáng
  } else if (hour >= 10 && hour < 17) {
    return "lunch"; // Trưa
  } else {
    return "dinner"; // Tối
  }
}

// Get time of day title
export function getTimeOfDayTitle() {
  const timeOfDay = getTimeOfDay();

  const titles = {
    morning: "Sáng nay, ăn gì?",
    lunch: "Trưa nay, ăn gì?",
    dinner: "Tối nay, ăn gì?",
  };

  return titles[timeOfDay];
}

// Get restaurants by time of day
export function getRestaurantsByTimeOfDay() {
  const timeOfDay = getTimeOfDay();

  let restaurantIds = [];

  if (timeOfDay === "morning") {
    restaurantIds = restaurantMealTimes.breakfast;
  } else if (timeOfDay === "lunch") {
    restaurantIds = restaurantMealTimes.lunch;
  } else {
    restaurantIds = restaurantMealTimes.dinner;
  }

  return restaurants.filter((r) => restaurantIds.includes(r.id)).slice(0, 5);
}

// Get available tables for a restaurant based on people count
export function getAvailableTables(restaurantId, peopleCount) {
  const tables = restaurantTablesData[restaurantId] || [];
  const availableTables = tables.filter((t) => t.isAvailable);

  // Filter tables that EXACTLY match the people count (not >=)
  const exactMatchTables = availableTables.filter(
    (t) => t.capacity === peopleCount
  );

  // Group by type
  const standardTables = exactMatchTables.filter((t) => t.type === "standard");
  const vipTables = exactMatchTables.filter((t) => t.type === "vip");

  // Calculate max capacity of the restaurant
  const maxCapacity = Math.max(...availableTables.map((t) => t.capacity), 0);

  return {
    standard: standardTables,
    vip: vipTables,
    allAvailable: availableTables,
    totalCapacity: availableTables.reduce((sum, t) => sum + t.capacity, 0),
    maxTableCapacity: maxCapacity,
  };
}

// Get reviews for a restaurant
export function getRestaurantReviews(restaurantId) {
  return reviews
    .filter(
      (r) =>
        r.restaurant_id === parseInt(restaurantId) && r.status === "VISIBLE"
    )
    .map((review) => {
      const user = users.find((u) => u.id === review.user_id);
      return {
        ...review,
        userName: user?.display_name || "Khách hàng",
        userAvatar: user?.avatar_url || "https://i.pravatar.cc/150?img=3",
      };
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}
