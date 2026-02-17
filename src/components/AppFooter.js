import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <a href="https://masterg.ai/" target="_blank" rel="noopener noreferrer">
          MasterG
        </a>
        <span className="ms-1">&copy; 2026 MasterG.</span>
      </div>
      <div className="ms-auto">
        <span className="me-1">Powered by</span>
        <a href="https://masterg.ai/" target="_blank" rel="noopener noreferrer">
          MasterG
        </a>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
