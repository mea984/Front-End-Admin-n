import PageBreadcrumb from "../common/PageBreadCrumb";
import PageMeta from "../common/PageMeta";
import ComponentCard from "../common/ComponentCard";
import ReusableTable from "../common/ReusableTable";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { addUser, getUsers } from "../../services/user";
import Pagination from "../pagination";
import { IUser } from "../../interface/user";
import FormModal from "../common/FormModal";
import { deleteUserById } from "../../services/user";
import { updateUser, getRoles, getUserByName } from "../../services/user";
import { IoIosAdd } from "react-icons/io";
import { Input, message } from "antd";
import Label from "../form/Label";

// import { PaginationApi } from "../../interface/pagination";

interface UsersProps {
  totalPage: number;
  data: IUser[];
}

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
  { key: "username", label: "Tên tài khoản" },
  { key: "phoneNumber", label: "Số điện thoại" },
  { key: "gender", label: "Giới tính" },
  { key: "email", label: "Email" },
  // { key: "avatar", label: "Avatar" },
  // { key: "background", label: "Ảnh bìa" },
  { key: "active", label: "Trạng thái" },
  { 
    key: "createdAt", 
    label: "Ngày tạo",
    render: (text: string) => formatDate(text)
  },
  { 
    key: "updatedAt", 
    label: "Ngày cập nhật",
    render: (text: string) => formatDate(text)
  },
];
export default function ManageUser() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [offset, setOffset] = useState(Number(searchParams.get("offset")) || 0);
  const [openModal, setOpenModal] = useState(false);
  const [openModalAdd, setOpenModalAdd] = useState(false);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [quantity, setQuantity] = useState(
    Number(searchParams.get("quantity")) || 5
  );
  // const [type, setType] = useState<ITypeNumber | undefined>(undefined);
  // const [types, setTypes] = useState<ITypeNumber[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [errorData, setErrorData] = useState("");
  const [users, setUsers] = useState<UsersProps | undefined>(undefined);
  const [search, setSearch] = useState<string>("");
  const [formFields, setFormFields] = useState<any[]>([]);
  const [formFieldsAddUser, setFormFieldsAddUser] = useState<any[]>([]);

  // Set default value of quantity và offset if do not have
  useEffect(() => {
    if (!searchParams.get("limit") || !searchParams.get("offset")) {
      setSearchParams((prev: any) => {
        const newParams = new URLSearchParams(prev);
        if (!newParams.get("limit")) newParams.set("limit", "5");
        if (!newParams.get("offset")) newParams.set("offset", "0");
        return newParams;
      });
    }
  }, [searchParams, setSearchParams]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getUsers({
        limit: quantity,
        offset: offset,
      });

      if (response?.data?.length === 0) {
        setError("Không có dữ liệu");
      } else {
        setError("");
      }
      setUsers(response);

      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("limit", quantity.toString());
        newParams.set("offset", offset.toString());
        return newParams;
      });
    } catch (error) {
      const axiosError = error as Error;
      setError(axiosError.message);
    } finally {
      setLoading(false);
    }
  }, [loading, quantity, offset]);
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      fetchUsers()
        .then(() => {
          setLoading(false);
        })
        .catch((error) => {
          setErrorData(error.message);
          setLoading(false);
        });
    }, 500);
  }, [quantity, offset]);

  const onEdit = async (item: IUser) => {
    const response = await getRoles();

    const roleIds = response?.data?.map((role: any) => {
      return {
        label: role.name,
        value: role.id,
      };
    });

    const roles_user = item?.roles?.map((role: any) => {
      return role.id;
    });

    setFormFields([
      {
        name: "id",
        label: "ID",
        type: "text",
        initialValue: item.id,
        disabled: true,
      },
      {
        name: "user_name",
        label: "Tên tài khoản",
        type: "text",
        placeholder: "Nhập tên tài khoản",
        initialValue: item.username,
        disabled: true,
      },
      {
        name: "email",
        label: "Email",
        type: "email",
        placeholder: "Không có email",
        initialValue: item.email,
        disabled: true,
      },
      {
        name: "phoneNumber",
        label: "Số điện thoại",
        type: "number",
        placeholder: "Không có số diện thoại",
        initialValue: item.phoneNumber,
        disabled: true,
      },
      {
        name: "password",
        label: "Mật khẩu",
        type: "text",
        placeholder: "Nhập mật khẩu",
        rules: [
          { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
          { max: 50, message: "Mật khẩu không được vượt quá 50 ký tự!" },
        ],
      },
      {
        name: "gender",
        label: "Giới tính",
        type: "select",
        placeholder: "Chọn giới tính",
        initialValue: item.gender || "KHAC",
        options: [
          { label: "Nam", value: "NAM" },
          { label: "Nữ", value: "NU" },
          { label: "Khác", value: "KHAC" },
        ],
      },
      {
        name: "active",
        label: "Trạng thái",
        type: "select",
        placeholder: "Chọn trạng thái",
        initialValue: item.active,
        options: [
          { label: "Hoạt Động", value: "1" },
          { label: "Chưa Hoạt Động", value: "0" },
          { label: "Vô Hiệu Hóa", value: "2" },
        ],
      },
      {
        name: "role_ids",
        label: "Quyền hạn",
        type: "checkbox-group",
        options: roleIds,
        initialValue: roles_user,
        rules: [
          {
            required: true,
            message: "Vui lòng chọn ít một quyền cho người dùng!",
          },
        ],
      },
    ]);
    setOpenModal(!openModal);
  };
  const onDelete = async (id: number | string) => {
    setLoading(true);
    try {
      const response = await deleteUserById(id);
      if (response?.status === 200) {
        message.success("Vô hiệu hóa người dùng thành công");
      }
    } catch (error) {
      const axiosError = error as Error;
      setError(axiosError.message);
    } finally {
      fetchUsers();
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  };
  // Handle Book Number
  const getIds = (data: any) => {
    setSelectedIds(data);
  };

  const handleSubmidUpdateUser = async (data: any) => {
    const response = await updateUser(data, data.id);

    if (response?.status === 200) {
      message.success("Cập nhật người dùng thành công");
      fetchUsers();
    } else {
      message.error("Cập nhật người dùng thất bại. Vui lòng thử lại!");
    }
    setOpenModal(false);
  };

  const handleKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      if (search.trim() !== "") {
        const response = await getUserByName(search);
        setUsers(() => ({
          totalPage: 1,
          data: response?.data ? [response.data] : [],
        }));
      } else {
        fetchUsers();
      }
    }
  };

  const handleAddUser = async (data: any) => {
    setLoading(true);
    const response = await addUser(data);
    if (response?.status === 201) {
      message.success("Thêm người dùng thành công");
      fetchUsers();
    } else if (response?.status === 409) {
      message.error("Email đã tồn tại. Vui lòng thử lại!");
    } else {
      message.error("Thêm người dùng thất bại. Vui lòng thử lại!");
    }

    setTimeout(() => {
      setOpenModalAdd(false);
      setLoading(false);
    }, 1000);
  };

  const handleShowModalAddUser = async () => {
    const response = await getRoles();
    const roleIds = response?.data?.map((role: any) => {
      return {
        label: role.name,
        value: role.id,
      };
    });

    setFormFieldsAddUser([
      {
        name: "user_name",
        label: "Họ tên",
        type: "text",
        placeholder: "Nhập họ tên",
        rules: [
          { required: true, message: "Vui lòng vào họ tên!" },
          { min: 6, message: "Tên tài khoản tối thiểu phải có 6 chữ số" },
        ],
      },
      {
        name: "email",
        label: "Email",
        type: "email",
        placeholder: "Nhập vào email",
      },
      {
        name: "phoneNumber",
        label: "Số điện thoại",
        type: "text",
        placeholder: "Không có số diện thoại",
        rules: [
          { min: 10, message: "Số điện thoại tối thiểu phải có 10 số" },
          {
            max: 11,
            message: "Số điện thoại không được vượt quá 11 ký tự!",
          },
        ],
      },
      {
        name: "password",
        label: "Mật khẩu",
        type: "text",
        placeholder: "Nhập mật khẩu",
        rules: [
          { required: true, message: "Vui lòng nhập mật khẩu!" },
          { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
          { max: 50, message: "Mật khẩu không được vượt quá 50 ký tự!" },
        ],
      },
      {
        name: "gender",
        label: "Giới tính",
        type: "select",
        placeholder: "Chọn giới tính",

        initialValue: "KHAC",
        options: [
          { label: "Nam", value: "NAM" },
          { label: "Nữ", value: "NU" },
          { label: "Khác", value: "KHAC" },
        ],
      },
      {
        name: "role_ids",
        label: "Quyền hạn",
        type: "checkbox-group",
        options: roleIds,
        rules: [
          {
            required: true,
            message: "Vui lòng chọn ít một quyền cho người dùng!",
          },
        ],
      },
    ]);
    setOpenModalAdd(!openModalAdd);
  };

  return (
    <>
      <div className="">
        <PageMeta
          title="Quản lý người dùng"
          description="Quản lý người dùng"
        />
        <PageBreadcrumb pageTitle="Quản lý người dùng" />
        <div className="flex justify-end mb-4">
          <button
            onClick={handleShowModalAddUser}
            className="flex items-center dark:bg-black dark:text-white  gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50">
            <IoIosAdd size={24} />
            Thêm
          </button>
        </div>
        <ComponentCard>
          <div className=" grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div>
              <Label htmlFor="inputTwo">Tìm kiếm theo tên tài khoản </Label>
              <Input
                type="text"
                id="inputTwo"
                placeholder="Nhập vào tên tài khoản..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>
          <ReusableTable
            error={errorData}
            title="Danh sách số điện thoại"
            data={users?.data ?? []}
            columns={columns}
            onEdit={onEdit}
            onDelete={onDelete}
            isLoading={loading}
            onCheck={(selectedIds) => getIds(selectedIds)}
            setSelectedIds={setSelectedIds}
            selectedIds={selectedIds}
          />

          <Pagination
            limit={quantity}
            offset={offset}
            totalPages={users?.totalPage ?? 1}
            onPageChange={(limit, newOffset) => {
              setQuantity(limit);
              setOffset(newOffset);
            }}
            onLimitChange={(newLimit) => {
              setQuantity(newLimit);
              setOffset(0); // Reset offset về 0 khi đổi limit
            }}
          />
        </ComponentCard>
      </div>
      <FormModal
        title="Cập nhật thông tin người dùng"
        isOpen={openModal}
        isLoading={false}
        onSubmit={(data) => handleSubmidUpdateUser(data)}
        onCancel={() => setOpenModal(false)}
        formFields={formFields}
      />
      <FormModal
        title="Thêm người dùng"
        isOpen={openModalAdd}
        isLoading={false}
        onSubmit={(data) => handleAddUser(data)}
        onCancel={() => setOpenModalAdd(false)}
        formFields={formFieldsAddUser ?? []}
      />
    </>
  );
}
