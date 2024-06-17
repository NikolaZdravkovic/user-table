import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import { useNavigate, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { useQuery } from '@tanstack/react-query';
import { User } from '../../types/types';
import NotificationIcon from '../icons/NotificationIcon';
import SearchIcon from '../icons/SearchIcon';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from '../ui/button';
import './UserTable.css';

const fetchUsers = async (): Promise<User[]> => {
    const { data } = await axios.get<User[]>(`${import.meta.env.VITE_API_URL}`);
    return data;
};

const UserTable: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { data: users } = useQuery<User[]>({
        queryKey: ['users'],
        queryFn: fetchUsers,
        staleTime: Infinity,
        refetchOnWindowFocus: 'always',
    });

    const [search, setSearch] = useState<string>('');
    const [createdFrom, setCreatedFrom] = useState<string>('');
    const [createdTo, setCreatedTo] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [sortField, setSortField] = useState<string>('firstName');
    const [sortDirection, setSortDirection] = useState<string>('asc');
    const itemsPerPage: number = 10;


    useEffect(() => {
        const { search, createdFrom, createdTo, page } = queryString.parse(location.search);
        if (search) setSearch(search as string);
        if (createdFrom) setCreatedFrom(createdFrom as string);
        if (createdTo) setCreatedTo(createdTo as string);
        if (page) setCurrentPage(Number(page) || 1);
    }, [location.search]);

    const updateQuery = (key: string, value: string) => {
        const searchParams = new URLSearchParams(location.search);
        searchParams.set(key, value);
        navigate({ search: searchParams.toString() });
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        updateQuery('search', value);
    };

    const handleCreatedFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCreatedFrom(e.target.value);
        updateQuery('createdFrom', e.target.value);
    };

    const handleCreatedToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCreatedTo(e.target.value);
        updateQuery('createdTo', e.target.value);
    };

    const handlePageClick = (data: { selected: number }) => {
        const newPage = data.selected + 1;
        setCurrentPage(newPage);
        updateQuery('page', newPage.toString());
    };

    const handleSort = (field: string) => {
        const direction = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortDirection(direction);
    };

    if (!users) return <div>Loading...</div>;

    const sortedUsers = [...users].sort((a, b) => {
        const aValue = a[sortField as keyof User];
        const bValue = b[sortField as keyof User];
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    const filteredUsers = sortedUsers.filter(user => {
        const matchesSearch = user.firstName.toLowerCase().includes(search.toLowerCase()) ||
            user.lastName.toLowerCase().includes(search.toLowerCase());
        const matchesCreatedFrom = !createdFrom || new Date(user.createdAt) >= new Date(createdFrom);
        const matchesCreatedTo = !createdTo || new Date(user.createdAt) <= new Date(createdTo);
        return matchesSearch && matchesCreatedFrom && matchesCreatedTo;
    });

    const displayedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString();
    };

    const totalResults = filteredUsers.length;
    const endResult = Math.min(currentPage * itemsPerPage, totalResults);

    return (
        <div className="user-table-container">
            <div className='user-nav pt-[25px] flex justify-between md:pt-[75px]'>
                <div className='user-heading flex font-primaryRegular'>
                    <div>Dashboard {'>'}</div>
                    <div className='flex'>Users</div>
                </div>

                <div className='user-avatar flex md:relative top-[20px] right-[10px]'>
                    <div className='notification md:relative right-[37px] top-[10px] '>
                        <NotificationIcon />
                    </div>
                    <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                </div>


            </div>
            <h1 className='font-primaryRegular flex md:text-[32px] pb-[25px] mt-[-15px]'>Users</h1>

            <div className="filters flex rounded-[10px] md:p-3 bg-zinc-100	">
                <input type="date" value={createdFrom} onChange={handleCreatedFromChange} placeholder="From" />
                <input type="date" value={createdTo} onChange={handleCreatedToChange} placeholder="To" />
                <div className='relative'>
                    <Input className=' md:w-[100%] pl-[35px]' value={search} onChange={handleSearchChange} placeholder="Search" />
                    <span className='absolute left-[10px] top-[10px] '>
                        <SearchIcon />
                    </span>
                </div>

            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px] font-bold" onClick={() => handleSort('id')}># {sortField === 'id' && (sortDirection === 'asc' ? '▼' : '▲')}</TableHead>
                        <TableHead onClick={() => handleSort('firstName')}>First name {sortField === 'firstName' && (sortDirection === 'asc' ? '▼' : '▲')}</TableHead>
                        <TableHead onClick={() => handleSort('lastName')}>Last name {sortField === 'lastName' && (sortDirection === 'asc' ? '▼' : '▲')}</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead>Date of birth</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {displayedUsers.map((user, index) => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">{index + 1 + (currentPage - 1) * itemsPerPage}</TableCell>
                            <TableCell>{user.firstName}</TableCell>
                            <TableCell>{user.lastName}</TableCell>
                            <TableCell>{user.gender}</TableCell>
                            <TableCell>{formatDate(user.dob)}</TableCell>
                            <TableCell>{formatDate(user.createdAt)}</TableCell>
                            <TableCell className={`status ${user.status.toLowerCase()}`}>
                                <Button className='w-full' variant={user.status}> {user.status}</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                    </TableRow>
                </TableFooter>
            </Table>
            <div>
                <div className="pagination-container justify-center pt-[30px] rounded-b-[10px] bg-zinc-100 flex md:justify-between flex-wrap font-primaryRegular md:flex-nowrap md:pt-10	pb-10 pr-5 ">
                    <ReactPaginate
                        previousLabel={'<'}
                        nextLabel={'>'}
                        breakLabel={'...'}
                        pageCount={Math.ceil(totalResults / itemsPerPage)}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={1}
                        onPageChange={handlePageClick}
                        containerClassName={'pagination md:relative left-1/4 '}
                        activeClassName={'active'}
                        forcePage={currentPage - 1} // Subtract 1 to match zero-based index
                    />
                    <div className="results-info pt-[30px]">
                        {`Showing ${endResult} of ${totalResults} results`}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserTable;
