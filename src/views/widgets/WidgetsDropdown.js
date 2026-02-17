import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'

import {
  CRow,
  CCol,
  CDropdown,
  CDropdownMenu,
  CDropdownItem,
  CDropdownToggle,
  CWidgetStatsA,
} from '@coreui/react'

import { getStyle } from '@coreui/utils'
import { CChartBar, CChartLine } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import { cilOptions } from '@coreui/icons'

import { getRetailers } from '../../services/retailerService'
import { getCategories } from '../../services/categoryService'
import { getProducts } from '../../services/productService'
import { getDeals } from '../../services/dealsService'

const WidgetsDropdown = (props) => {
  const widgetChartRef1 = useRef(null)
  const widgetChartRef2 = useRef(null)

  const [counts, setCounts] = useState({
    retailers: 0,
    products: 0,
    categories: 0,
    deals: 0,
  })

  // 🔹 Load counts
  useEffect(() => {
    const loadCounts = async () => {
      try {
        const retailers = await getRetailers()
        const products = await getProducts()
        const categories = await getCategories()
        const deals = await getDeals()

        setCounts({
          retailers: retailers?.count ?? retailers.length ?? 0,
          products: products?.count ?? products.length ?? 0,
          categories: categories?.count ?? categories.length ?? 0,
          deals: deals?.count ?? deals.length ?? 0,
        })
      } catch (err) {
        console.error('Dashboard count error:', err)
      }
    }

    loadCounts()
  }, [])

  // 🔹 Theme change listener
  useEffect(() => {
    document.documentElement.addEventListener('ColorSchemeChange', () => {
      if (widgetChartRef1.current) {
        widgetChartRef1.current.update()
      }
      if (widgetChartRef2.current) {
        widgetChartRef2.current.update()
      }
    })
  }, [])

  return (
    <CRow className={props.className} xs={{ gutter: 4 }}>
      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsA color="primary" value={counts.retailers} title="Retailers" />
      </CCol>

      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsA color="info" value={counts.products} title="Products" />
      </CCol>

      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsA color="warning" value={counts.categories} title="Categories" />
      </CCol>

      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsA color="danger" value={counts.deals} title="Deals" />
      </CCol>
    </CRow>
  )
}

WidgetsDropdown.propTypes = {
  className: PropTypes.string,
}

export default WidgetsDropdown
