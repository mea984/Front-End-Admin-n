import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  GroupIcon,
  FolderIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";
import { getDashboard } from "../../services/user";
import { getReportCollection } from "../../services/report";
import { useEffect, useState } from "react";
import { Spin } from "antd";

interface DashboardData {
  quantity_users: number;
  quantity_file: number;
}

interface CollectionStats {
  status: number;
  message: string;
  data: {
    collectionCount: number;
  };
}

export default function EcommerceMetrics() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataDashboard, setDataDashboard] = useState<DashboardData | null>(null);
  const [collectionStats, setCollectionStats] = useState<CollectionStats | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch dashboard data
        const response = await getDashboard();
        setDataDashboard(response);

        // Fetch collection stats for current date
        const currentDate = new Date();
        const collectionResponse = await getReportCollection(
          currentDate.getFullYear(),
          0,
          0
        );
        setCollectionStats(collectionResponse);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-32">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-32 text-error-500">
        {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6 w-full">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 w-full">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Tổng số người dùng trong hệ thống
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {dataDashboard?.quantity_users?.toLocaleString() || 0}
            </h4>
          </div>
          {/* <Badge color="success">
            <ArrowUpIcon />
            11.01%
          </Badge> */}
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 w-full">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Tổng số files trong hệ thống
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {dataDashboard?.quantity_file?.toLocaleString() || 0}
            </h4>
          </div>
        </div>
      </div>

      {/* <!-- Collection Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 w-full">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <FolderIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Tổng số bộ sưu tập trong hệ thống
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {collectionStats?.data?.collectionCount?.toLocaleString() || 0}
            </h4>
          </div>
        </div>
      </div>
      {/* <!-- Collection Metric Item End --> */}
    </div>
  );
}
