import PageBreadcrumb from "../common/PageBreadCrumb";
import PageMeta from "../common/PageMeta";
import ComponentCard from "../common/ComponentCard";
import ReusableTable from "../common/ReusableTable";
import { useEffect, useState } from "react";
import { getReportCollection, getReportFile, getReportUser, getUserFileDetails } from "../../services/report";
import { Select, Input, message, DatePicker, Space, Card, Row, Col, Statistic, Button } from "antd";
import { CalendarOutlined, FileOutlined, TeamOutlined, DatabaseOutlined, DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

const columns = [
  { key: "id", label: "STT" },
  { key: "title", label: "Loại thống kê" },
  { key: "value", label: "Giá trị" },
  { key: "unit", label: "Đơn vị" },
];

export default function ManageReport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorData, setErrorData] = useState("");
  const [reportData, setReportData] = useState<any[]>([]);
  const [userDetails, setUserDetails] = useState<any[]>([]);
  
  // State cho năm, tháng, ngày
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(dayjs());

  // Tạo danh sách năm (5 năm gần nhất)
  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i);
  
  // Tạo danh sách tháng
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const [fileStats, collectionStats, userStats, userDetailsData] = await Promise.all([
        getReportFile(selectedYear, selectedMonth, selectedDay || undefined),
        getReportCollection(selectedYear, selectedMonth, selectedDay || undefined),
        getReportUser(selectedYear, selectedMonth, selectedDay || undefined),
        getUserFileDetails(selectedYear, selectedMonth, selectedDay || undefined)
      ]);

      if (fileStats?.status === 200 && collectionStats?.status === 200 && userStats?.status === 200) {
        const data = [
          {
            id: 1,
            title: "Tổng số người dùng",
            value: userStats.data.userCount,
            unit: "người",
          },
          {
            id: 2,
            title: "Tổng số file đã tải lên",
            value: fileStats.data.fileCount,
            unit: "file",
          },
          {
            id: 3,
            title: "Tổng số bộ sưu tập",
            value: collectionStats.data.collectionCount,
            unit: "bộ",
          },
          {
            id: 4,
            title: "Tổng dung lượng đã sử dụng",
            value: fileStats.data.totalSize.toFixed(2),
            unit: "MB",
          },
        ];
        setReportData(data);
        setUserDetails(userDetailsData.data || []);
        setError("");
      } else {
        setError("Không thể lấy dữ liệu thống kê");
        message.error("Không thể lấy dữ liệu thống kê");
      }
    } catch (error) {
      const axiosError = error as Error;
      setError(axiosError.message);
      message.error("Lỗi khi lấy dữ liệu thống kê: " + axiosError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      setSelectedDate(date);
      setSelectedYear(date.year());
      setSelectedMonth(date.month() + 1);
      setSelectedDay(date.date());
    } else {
      setSelectedDate(null);
      setSelectedDay(null);
    }
  };

  const exportToExcel = () => {
    try {
      // Kiểm tra dữ liệu trước khi xuất
      if (!userDetails || userDetails.length === 0) {
        message.warning('Không có dữ liệu để xuất báo cáo!');
        return;
      }

      // Kiểm tra xem có dữ liệu thống kê không
      if (!reportData || reportData.length === 0) {
        message.warning('Không có dữ liệu thống kê để xuất!');
        return;
      }

      // Tạo workbook mới
      const wb = XLSX.utils.book_new();
      
      // Sheet 1: Thống kê tổng quan
      const overviewData = reportData.map(item => ({
        'Loại thống kê': item.title,
        'Giá trị': item.value,
        'Đơn vị': item.unit
      }));
      const ws1 = XLSX.utils.json_to_sheet(overviewData);
      XLSX.utils.book_append_sheet(wb, ws1, "Thống kê tổng quan");

      // Sheet 2: Chi tiết người dùng và file
      const userDetailsData = userDetails.map(user => ({
        'ID': user.id,
        'Tên người dùng': user.username,
        'Email': user.email || 'N/A',
        'Số điện thoại': user.phoneNumber || 'N/A',
        'Giới tính': user.gender || 'N/A',
        'Trạng thái': user.active,
        'Ngày tạo': dayjs(user.createdAt).format('DD/MM/YYYY HH:mm:ss'),
        'Vai trò': user.roles.map((role: any) => role.name).join(', ') || 'N/A',
        'Số file': user.files.length,
        'Số bộ sưu tập': user.collections.length,
        'Tổng dung lượng file (MB)': (user.files.reduce((acc: number, file: any) => acc + file.fileSize, 0) / (1024 * 1024)).toFixed(2)
      }));
      const ws2 = XLSX.utils.json_to_sheet(userDetailsData);
      XLSX.utils.book_append_sheet(wb, ws2, "Chi tiết người dùng");

      // Sheet 3: Chi tiết file
      const fileDetails = userDetails.flatMap(user => 
        user.files.map((file: any) => ({
          'ID': file.id,
          'Tên người dùng': user.username,
          'Tên file': file.fileName,
          'Loại file': file.fileType,
          'Dung lượng (MB)': (file.fileSize / (1024 * 1024)).toFixed(2),
          'Ngày tạo': dayjs(file.createAt).format('DD/MM/YYYY HH:mm:ss'),
          'URL': file.cloudinaryUrl
        }))
      );
      const ws3 = XLSX.utils.json_to_sheet(fileDetails);
      XLSX.utils.book_append_sheet(wb, ws3, "Chi tiết file");

      // Sheet 4: Chi tiết bộ sưu tập
      const collectionDetails = userDetails.flatMap(user => 
        user.collections.map((collection: any) => ({
          'ID': collection.id,
          'Tên người dùng': user.username,
          'Tên bộ sưu tập': collection.name,
          'Mô tả': collection.description || 'N/A',
          'Số file': collection.files.length,
          'Ngày tạo': dayjs(collection.createAt).format('DD/MM/YYYY HH:mm:ss')
        }))
      );
      const ws4 = XLSX.utils.json_to_sheet(collectionDetails);
      XLSX.utils.book_append_sheet(wb, ws4, "Chi tiết bộ sưu tập");

      // Xuất file Excel
      const fileName = `Bao_cao_thong_ke_${selectedYear}_${selectedMonth}${selectedDay ? `_${selectedDay}` : ''}.xlsx`;
      XLSX.writeFile(wb, fileName);
      message.success('Xuất báo cáo thành công!');
    } catch (error) {
      message.error('Lỗi khi xuất báo cáo: ' + (error as Error).message);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [selectedYear, selectedMonth, selectedDay]);

  return (
    <div className="">
      <PageMeta
        title="Báo cáo thống kê"
        description="Báo cáo thống kê"
      />
      <PageBreadcrumb pageTitle="Báo cáo thống kê" />
      <ComponentCard title="Thống kê hệ thống">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 mb-6">
          <div>
            <label className="mb-2.5 block text-black dark:text-white font-medium">
              Năm
            </label>
            <Select
              className="w-full"
              value={selectedYear}
              onChange={setSelectedYear}
              options={years.map(year => ({ value: year, label: year }))}
            />
          </div>
          <div>
            <label className="mb-2.5 block text-black dark:text-white font-medium">
              Tháng
            </label>
            <Select
              className="w-full"
              value={selectedMonth}
              onChange={setSelectedMonth}
              options={months.map(month => ({ value: month, label: month }))}
            />
          </div>
          <div>
            <label className="mb-2.5 block text-black dark:text-white font-medium">
              Ngày (Tùy chọn)
            </label>
            <DatePicker
              className="w-full"
              value={selectedDate}
              onChange={handleDateChange}
              allowClear
              placeholder="Chọn ngày hoặc để trống"
              format="DD/MM/YYYY"
            />
          </div>
        </div>

        <div className="flex justify-end mb-6">
          <Button 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={exportToExcel}
            loading={loading}
            disabled={!userDetails || userDetails.length === 0}
            className="flex items-center gap-2"
          >
            Xuất báo cáo Excel
          </Button>
        </div>

        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic
                title="Tổng số người dùng"
                value={reportData[0]?.value || 0}
                suffix="người"
                prefix={<TeamOutlined className="text-blue-500" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic
                title="Tổng số file"
                value={reportData[1]?.value || 0}
                suffix="file"
                prefix={<FileOutlined className="text-green-500" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic
                title="Tổng số bộ sưu tập"
                value={reportData[2]?.value || 0}
                suffix="bộ"
                prefix={<DatabaseOutlined className="text-purple-500" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic
                title="Dung lượng đã sử dụng"
                value={reportData[3]?.value || 0}
                suffix="MB"
                prefix={<CalendarOutlined className="text-orange-500" />}
              />
            </Card>
          </Col>
        </Row>

        <ReusableTable
          error={errorData}
          title="Chi tiết thống kê"
          data={reportData}
          columns={columns}
          isLoading={loading}
        />
      </ComponentCard>
    </div>
  );
}
