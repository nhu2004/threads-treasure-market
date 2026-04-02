import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import productApi from "../../../api/productApi";

export const useProductList = () => {
  const [bookData, setBookData] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchString, setSearchString] = useState("");
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const query = {
          name: { $regex: searchString, $options: "i" },
        };
        const res = await productApi.getAll({ query, page: page, limit: 10 });
        setLoading(false);
        setBookData({ books: res.data, totalPage: res.pagination.totalPage });
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };
    fetchData();
  }, [page, searchString, location.search]);

  const handleSearch = () => {
    setSearchString(searchInput);
    setPage(1);
  };

  const removeBook = (productId) => {
    setBookData((preState) => {
      const newArray = [...preState.books];
      return {
        ...preState,
        books: newArray.filter((item) => item._id !== productId),
      };
    });
  };

  return {
    bookData,
    page,
    setPage,
    loading,
    searchInput,
    setSearchInput,
    handleSearch,
    removeBook,
  };
};






