import React, { useState, useEffect } from 'react'

import {
  CRow,
  CCol,
  CWidgetStatsA,
  CCard,
  CCardBody,
  CCardHeader,
  CButtonGroup,
  CButton,
} from '@coreui/react'

import { getApiAnalytics } from '../../services/analyticsService'

const ApiAnalytics = () => {

  const [range, setRange] = useState('1H')

  const [data, setData] = useState({
    totalRequests: 0,
    successRate: 0,
    errors4xx: 0,
    errors5xx: 0,
    avgLatency: 0,
    totalErrors: 0,
    errorRate: 0,
  })

  const [loading, setLoading] = useState(true)

  // 🔹 Load Analytics
  const loadAnalytics = async (selectedRange) => {
    try {

      setLoading(true)

      const res = await getApiAnalytics(selectedRange)

      console.log("Analytics API Response:", res)

      setData(res)

    } catch (error) {

      console.error("Analytics API error", error)

    } finally {

      setLoading(false)

    }
  }

  // 🔹 First Load
  useEffect(() => {
    loadAnalytics(range)
  }, [])

  // 🔹 Range Change
  useEffect(() => {
    loadAnalytics(range)
  }, [range])

  return (
    <CCard className="mt-4 mb-4">

      <CCardHeader className="d-flex justify-content-between align-items-center">
        <strong>API Performance Metrics</strong>

        <CButtonGroup>

          <CButton
            color={range === '1H' ? 'primary' : 'light'}
            onClick={() => setRange('1H')}
          >
            1H
          </CButton>

          <CButton
            color={range === '24H' ? 'primary' : 'light'}
            onClick={() => setRange('24H')}
          >
            24H
          </CButton>

          <CButton
            color={range === '7D' ? 'primary' : 'light'}
            onClick={() => setRange('7D')}
          >
            7D
          </CButton>

          <CButton
            color={range === '30D' ? 'primary' : 'light'}
            onClick={() => setRange('30D')}
          >
            30D
          </CButton>

        </CButtonGroup>

      </CCardHeader>

      <CCardBody>

        <CRow xs={{ gutter: 4 }}>

          <CCol sm={6} xl={3}>
            <CWidgetStatsA
              color="primary"
              value={loading ? "..." : data.totalRequests}
              title="Total Requests"
            />
          </CCol>

          <CCol sm={6} xl={3}>
            <CWidgetStatsA
              color="success"
              value={loading ? "..." : `${data.successRate}%`}
              title="Success Rate"
            />
          </CCol>

          <CCol sm={6} xl={3}>
            <CWidgetStatsA
              color="warning"
              value={loading ? "..." : data.errors4xx}
              title="4xx Errors"
            />
          </CCol>

          <CCol sm={6} xl={3}>
            <CWidgetStatsA
              color="danger"
              value={loading ? "..." : data.errors5xx}
              title="5xx Errors"
            />
          </CCol>

          <CCol sm={6} xl={3}>
            <CWidgetStatsA
              color="info"
              value={loading ? "..." : `${data.avgLatency} ms`}
              title="Avg Latency"
            />
          </CCol>

          <CCol sm={6} xl={3}>
            <CWidgetStatsA
              color="secondary"
              value={loading ? "..." : data.totalErrors}
              title="Total Errors"
            />
          </CCol>

          <CCol sm={6} xl={3}>
            <CWidgetStatsA
              color="dark"
              value={loading ? "..." : `${data.errorRate}%`}
              title="Error Rate"
            />
          </CCol>

        </CRow>

      </CCardBody>

    </CCard>
  )
}

export default ApiAnalytics