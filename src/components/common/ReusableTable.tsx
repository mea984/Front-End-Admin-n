import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { PencilIcon } from "../../icons";
import { RiDeleteBinLine } from "react-icons/ri";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Popconfirm } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
interface Action<T> {
  icon?: React.ReactNode;
  onClick: (item: T) => void;
  className?: string;
  condition?: (item: T) => boolean;
}

interface Props<T> {
  title: string;
  data?: T[];
  columns: {
    key: keyof T;
    label: string;
  }[];
  onEdit?: (item: T) => void;
  onDelete?: (id: string | number) => void;
  actions?: Action<T>[];
  onCheck?: (selectedIds: (string | number)[], selectedRows: T[]) => void; // Sửa đổi onCheck
  selectedIds?: (string | number)[];
  setSelectedIds?: React.Dispatch<React.SetStateAction<number[]>>;
  isLoading: boolean;
  error?: string;
}

const ReusableTable = <T extends { id: string | number }>({
  data = [],
  columns,
  onEdit,
  onDelete,
  actions = [],
  onCheck,
  selectedIds,
  setSelectedIds,
  isLoading = false,
  error = "",
}: Props<T>) => {
  const hasActionColumn = onEdit || onDelete || actions.length > 0;

  const handleSelectAll = () => {
    if (!setSelectedIds) return;
    if (!selectedIds) return;

    if (data.every((item) => selectedIds.includes(item.id))) {
      setSelectedIds([]);
      onCheck?.([], []); // Truyền cả mảng rỗng cho selectedRows
    } else {
      const allIds = data
        .map((item) => Number(item.id))
        .filter((id) => !isNaN(id));
      setSelectedIds(allIds);
      onCheck?.(allIds, data); // Truyền toàn bộ data khi chọn tất cả
    }
  };

  const handleSelectRow = (id: string | number) => {
    if (!setSelectedIds) return;
    if (!selectedIds) return;

    let updatedSelection: (string | number)[];
    let updatedRows: T[];

    if (selectedIds.includes(id)) {
      updatedSelection = selectedIds.filter((selectedId) => selectedId !== id);
      updatedRows = data.filter((item) => updatedSelection.includes(item.id));
    } else {
      updatedSelection = [...selectedIds, id];
      updatedRows = data.filter((item) => updatedSelection.includes(item.id));
    }

    const numericIds = updatedSelection
      .map((id) => Number(id))
      .filter((id) => !isNaN(id));
    setSelectedIds(numericIds);
    onCheck?.(updatedSelection, updatedRows); // Truyền cả IDs và rows data
  };

  return error ? (
    <div>{error}</div>
  ) : (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="overflow-x-auto w-full">
        <div className="max-h-[400px] overflow-y-auto dark:bg-black">
          <Table className="dark:text-white">
            {/* Table Header */}
            <TableHeader>
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-base font-semibold text-gray-500 dark:text-gray-300 text-start">
                  <input
                    type="checkbox"
                    className="w-[18px] h-[18px]"
                    checked={
                      selectedIds?.length === data.length && data.length > 0
                    }
                    onChange={handleSelectAll}
                    disabled={!setSelectedIds}
                  />
                </TableCell>
                {columns.map((col) => (
                  <TableCell
                    key={col.key as string}
                    isHeader
                    className="px-5 dark:text-gray-300 py-3 text-base font-semibold text-gray-500 text-start min-w-[120px] max-w-[200px]">
                    {col.label}
                  </TableCell>
                ))}
                {hasActionColumn && (
                  <TableCell
                    isHeader
                    className="px-5 dark:text-gray-300 py-3 text-base font-semibold text-gray-500 text-start">
                    Hành động
                  </TableCell>
                )}
              </TableRow>
            </TableHeader>
            {/* Table Body */}
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell className="px-5 dark:text-gray-300 py-3">
                      <Skeleton width={18} height={18} />
                    </TableCell>
                    {columns.map((col) => (
                      <TableCell
                        key={col.key as string}
                        className="px-5 py-3 text-sm text-gray-500 dark:text-gray-300 min-w-[100px]">
                        <Skeleton width="100%" height={28} />
                      </TableCell>
                    ))}
                    {hasActionColumn && (
                      <TableCell className="flex gap-2 px-5 py-3">
                        <Skeleton width={50} height={32} />
                        <Skeleton width={50} height={32} />
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : data && data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + 1}
                    className="text-center py-3 dark:text-gray-300 w-full">
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="px-5 dark:text-gray-300 py-3">
                      <input
                        type="checkbox"
                        className="w-[18px] h-[18px]"
                        checked={selectedIds?.includes(item.id)}
                        onChange={() => handleSelectRow(item.id)}
                        disabled={!setSelectedIds}
                      />
                    </TableCell>
                    {columns.map((col) => (
                      <TableCell
                        key={col.key as string}
                        className="px-5 py-3 text-sm text-gray-500 dark:text-gray-300">
                        {item[col.key] as string}
                      </TableCell>
                    ))}
                    {hasActionColumn && (
                      <TableCell className="flex gap-2 px-5 py-3">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            className="bg-yellow-400 text-white px-4 py-2 rounded-full text-sm hover:brightness-110 transition-all duration-200">
                            <PencilIcon />
                          </button>
                        )}
                        {onDelete && (
                          <Popconfirm
                            title="Bạn có chắc muốn xóa mục này?"
                            onConfirm={() => onDelete(item.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                            placement="topRight"
                            icon={<DeleteOutlined style={{ color: "red" }} />}
                            okButtonProps={{ danger: true }}>
                            <button className="bg-red-400 text-white px-4 py-2 rounded-full text-sm hover:brightness-110 transition-all duration-200">
                              <RiDeleteBinLine />
                            </button>
                          </Popconfirm>
                        )}
                        {actions
                          .filter((action) =>
                            action.condition ? action.condition(item) : true
                          )
                          .map((action, index) => (
                            <button
                              key={index}
                              onClick={() => action.onClick(item)}
                              className={`px-4 py-2 rounded-full text-sm hover:brightness-110 transition-all duration-200 ${action.className}`}>
                              {action.icon}
                            </button>
                          ))}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default ReusableTable;
