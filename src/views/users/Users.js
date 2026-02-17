import React, { useEffect, useState } from 'react'
import {
  CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell, CAvatar, CBadge,
  CPagination, CPaginationItem, CSpinner
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPeople, cilTrash, cilZoom } from '@coreui/icons'
import config from '../../config'

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const usersPerPage = 10

  // ✅ FUNCTION OUTSIDE useEffect
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${config.BASE_URL}/auth/users`)
      const data = await res.json()
      setUsers(data.data.users)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const formatDate = (timestamp) =>
    new Date(timestamp).toLocaleDateString()

  const currentUsers = users.slice(
    (page - 1) * usersPerPage,
    page * usersPerPage
  )

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return
    await fetch(`${config.BASE_URL}/auth/users/${id}`, { method: 'DELETE' })
    fetchUsers()
  }

  const handleAdminConfirm = async (user) => {
    try {
      const body = user.email
        ? { email: user.email }
        : { phone_number: user.phoneNumber }
  
      const res = await fetch(`${config.BASE_URL}/auth/admin-confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
  
      const data = await res.json()
  
      if (res.ok) {
        alert("User confirmed successfully")
        fetchUsers() // Refresh table
      } else {
        alert(data.message || "Something went wrong")
      }
    } catch (error) {
      console.error(error)
      alert("Server error")
    }
  }
  

  if (loading) return <CSpinner color="primary" />

  return (
    <>
      <CTable align="middle" className="mb-0 border" hover responsive>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell className="text-center">
              <CIcon icon={cilPeople} /> Users
            </CTableHeaderCell>
            <CTableHeaderCell>Status</CTableHeaderCell>
            <CTableHeaderCell>Email Verified</CTableHeaderCell>
            <CTableHeaderCell>Phone Verified</CTableHeaderCell>
            <CTableHeaderCell>Created</CTableHeaderCell>
            <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>

        <CTableBody>
          {currentUsers.map((user) => (
            <CTableRow key={user.userId}>
              <CTableDataCell>
                <div className="d-flex align-items-center gap-2">
                  <CAvatar
                    size="md"
                    src={`https://ui-avatars.com/api/?name=${user.name}`}
                    status={user.enabled ? 'success' : 'secondary'}
                  />
                  <div>
                    <div>{user.name}</div>
                    <small className="text-body-secondary">
                      {user.email || user.phoneNumber}
                    </small>
                  </div>
                </div>
              </CTableDataCell>

              <CTableDataCell>
                <CBadge color={user.status === 'CONFIRMED' ? 'success' : 'warning'}>
                  {user.status}
                </CBadge>
              </CTableDataCell>

              <CTableDataCell>
                <CBadge color={user.emailVerified ? 'success' : 'danger'}>
                  {user.emailVerified ? 'Verified' : 'Not Verified'}
                </CBadge>
              </CTableDataCell>

              <CTableDataCell>
                <CBadge
                  color={
                    user.attributes.phone_number_verified === 'true'
                      ? 'success'
                      : 'danger'
                  }
                >
                  {user.attributes.phone_number_verified === 'true'
                    ? 'Verified'
                    : 'Not Verified'}
                </CBadge>
              </CTableDataCell>

              <CTableDataCell>{formatDate(user.createdAt)}</CTableDataCell>

              <CTableDataCell className="text-center">
                {/* <CIcon icon={cilZoom} className="me-3 cursor-pointer" /> */}

                {user.status !== "CONFIRMED" && (
                    <CBadge
                    color="primary"
                    style={{ cursor: "pointer" }}
                    className="cursor-pointer"
                    onClick={() => handleAdminConfirm(user)}
                    >
                    Admin Confirm
                    </CBadge>
                )}
                <CIcon
                  icon={cilTrash}
                  className="text-danger cursor-pointer"
                  onClick={() => handleDelete(user.userId)}
                />
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      {/* 🔥 Pagination */}
      <CPagination align="center" className="mt-3">
        {[...Array(Math.ceil(users.length / usersPerPage)).keys()].map((n) => (
          <CPaginationItem
            key={n}
            active={page === n + 1}
            onClick={() => setPage(n + 1)}
          >
            {n + 1}
          </CPaginationItem>
        ))}
      </CPagination>
    </>
  )
}

export default Users
