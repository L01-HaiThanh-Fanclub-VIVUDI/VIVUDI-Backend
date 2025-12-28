import { ApiProperty } from '@nestjs/swagger';

/**
 * Standard API Response Format
 * 
 * Tất cả các API endpoints trong hệ thống đều trả về response theo cấu trúc chuẩn này.
 * 
 * @example
 * {
 *   "success": true,
 *   "message": "Operation completed successfully",
 *   "data": { ... }
 * }
 */
export class ApiResponseDto<T = any> {
  /**
   * Trạng thái thành công/thất bại của request
   * - true: Request được xử lý thành công
   * - false: Request gặp lỗi (validation, authentication, server error...)
   */
  @ApiProperty({ 
    example: true, 
    description: 'Trạng thái thành công/thất bại của request. true = thành công, false = thất bại',
    type: Boolean
  })
  success: boolean;

  /**
   * Thông báo mô tả kết quả của request
   * - Khi success = true: Thông báo thành công (ví dụ: "Login successful", "Post created successfully")
   * - Khi success = false: Thông báo lỗi cụ thể (ví dụ: "Email already exists", "Invalid credentials")
   */
  @ApiProperty({ 
    example: 'Operation completed successfully', 
    description: 'Thông báo mô tả kết quả của request. Có thể là thông báo thành công hoặc lỗi.',
    type: String
  })
  message: string;

  /**
   * Dữ liệu trả về từ API
   * - Có thể là object, array, hoặc null tùy theo endpoint
   * - Khi success = false: Thường là null
   * - Khi success = true: Chứa dữ liệu thực tế (user info, post data, list items...)
   * 
   * @example
   * // Login response
   * data: {
   *   user: { id: "...", email: "..." },
   *   token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   * }
   * 
   * // Get list response
   * data: [
   *   { id: 1, name: "..." },
   *   { id: 2, name: "..." }
   * ]
   * 
   * // Error response
   * data: null
   */
  @ApiProperty({ 
    description: 'Dữ liệu trả về từ API. Có thể là object, array, hoặc null tùy theo endpoint. Xem chi tiết trong từng endpoint cụ thể.',
    nullable: true
  })
  data: T | null;
}

