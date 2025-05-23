import PageBreadcrumb from "../common/PageBreadCrumb";
import PageMeta from "../common/PageMeta";
import ComponentCard from "../common/ComponentCard";
import ReusableTable from "../common/ReusableTable";
import { useCallback, useEffect, useState } from "react";
import { IoIosAdd } from "react-icons/io";
import { Input, message } from "antd";
import Label from "../form/Label";
import { IRole } from "../../interface/role";
import { addRole, deleteRole, getRoles, updateRole } from "../../services/role";
import FormModal from "../common/FormModal";

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const columns: { key: any; label: string; render?: (text: string) => string }[] = [
  { key: "id", label: "ID" },
  { key: "name", label: "Tên vai trò" },
  { key: "descRole", label: "Mô tả" },
  { 
    key: "createAt", 
    label: "Ngày tạo",
    render: (text: string) => formatDate(text)
  },
  { 
    key: "updateAt", 
    label: "Ngày cập nhật",
    render: (text: string) => formatDate(text)
  },
];

export default function ManageRole() {
  const [openModal, setOpenModal] = useState(false);
  const [openModalAdd, setOpenModalAdd] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [errorData, setErrorData] = useState("");
  const [roles, setRoles] = useState<IRole[]>([]);
  const [search, setSearch] = useState<string>("");
  const [formFields, setFormFields] = useState<any[]>([]);
  const [formFieldsAddRole, setFormFieldsAddRole] = useState<any[]>([]);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getRoles();
      if (response?.data?.length === 0) {
        setError("Không có dữ liệu");
      } else {
        setError("");
      }
      setRoles(response?.data ?? []);
    } catch (error) {
      const axiosError = error as Error;
      setError(axiosError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback(async () => {
    if (search.trim() === "") {
      fetchRoles();
      return;
    }

    setLoading(true);
    try {
      const response = await getRoles();
      if (response?.data) {
        const filteredRoles = response.data.filter((role: IRole) =>
          role.name.toLowerCase().includes(search.toLowerCase())
        );
        setRoles(filteredRoles);
        if (filteredRoles.length === 0) {
          setError("Không tìm thấy vai trò nào");
        } else {
          setError("");
        }
      }
    } catch (error) {
      const axiosError = error as Error;
      setError(axiosError.message);
    } finally {
      setLoading(false);
    }
  }, [search, fetchRoles]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      fetchRoles()
        .then(() => {
          setLoading(false);
        })
        .catch((error) => {
          setErrorData(error.message);
          setLoading(false);
        });
    }, 1000);
  }, []);

  const onEdit = async (item: IRole) => {
    setFormFields([
      {
        name: "id",
        label: "ID",
        type: "text",
        initialValue: item.id,
        disabled: true,
      },
      {
        name: "name",
        label: "Tên vai trò",
        type: "text",
        placeholder: "Nhập tên vai trò",
        initialValue: item.name,
      },
      {
        name: "descRole",
        label: "Mô tả",
        type: "textarea",
        placeholder: "Nhập mô tả",
        initialValue: item.descRole,
      },
    ]);
    setOpenModal(!openModal);
  };

  const onDelete = async (id: string | number) => {
    setLoading(true);
    try {
      const response = await deleteRole(Number(id));
      if (response?.status === 200) {
        message.success("Xóa vai trò thành công");
        fetchRoles();
      } else {
        message.error(response?.message);
      }
    } catch (error) {
      const axiosError = error as Error;
      setError(axiosError.message);
      message.error("Xóa vai trò thất bại: " + axiosError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitUpdateRole = async (data: any) => {
    const response = await updateRole(data.id, data);
    if (response?.status === 200) {
      message.success("Cập nhật vai trò thành công");
      fetchRoles();
    } else {
      message.error("Cập nhật vai trò thất bại. Vui lòng thử lại!");
    }
    setOpenModal(false);
  };

  const handleAddRole = async (data: any) => {
    setLoading(true);
    const response = await addRole(data);
    if (response?.status === 200) {
      message.success("Thêm vai trò thành công");
      fetchRoles();
    } else {
      message.error("Thêm vai trò thất bại. Vui lòng thử lại!");
    }
    setTimeout(() => {
      setOpenModalAdd(false);
      setLoading(false);
    }, 1000);
  };

  const handleShowModalAddRole = () => {
    setFormFieldsAddRole([
      {
        name: "name",
        label: "Tên vai trò",
        type: "text",
        placeholder: "Nhập tên vai trò",
        rules: [
          { required: true, message: "Vui lòng nhập tên vai trò!" },
          { min: 3, message: "Tên vai trò phải có ít nhất 3 ký tự!" },
        ],
      },
      {
        name: "descRole",
        label: "Mô tả",
        type: "textarea",
        placeholder: "Nhập mô tả",
      },
    ]);
    setOpenModalAdd(!openModalAdd);
  };


  return (
    <>
      <div className="">
        <PageMeta
          title="Quản lý vai trò"
          description="Quản lý vai trò"
        />
        <PageBreadcrumb pageTitle="Quản lý vai trò" />
        <div className="flex justify-end mb-4">
          <button
            onClick={handleShowModalAddRole}
            className="flex items-center dark:bg-black dark:text-white gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50">
            <IoIosAdd size={24} />
            Thêm
          </button>
        </div>
        <ComponentCard>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div>
              <Label htmlFor="inputTwo">Tìm kiếm theo tên vai trò</Label>
              <Input
                type="text"
                id="inputTwo"
                placeholder="Nhập vào tên vai trò..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>
          <ReusableTable
            error={errorData}
            title="Danh sách vai trò"
            data={roles}
            columns={columns}
            onEdit={onEdit}
            onDelete={onDelete}
            isLoading={loading}
          />
        </ComponentCard>
      </div>
      <FormModal
        title="Cập nhật thông tin vai trò"
        isOpen={openModal}
        isLoading={false}
        onSubmit={(data) => handleSubmitUpdateRole(data)}
        onCancel={() => setOpenModal(false)}
        formFields={formFields}
      />
      <FormModal
        title="Thêm vai trò"
        isOpen={openModalAdd}
        isLoading={false}
        onSubmit={(data) => handleAddRole(data)}
        onCancel={() => setOpenModalAdd(false)}
        formFields={formFieldsAddRole}
      />
    </>
  );
}
