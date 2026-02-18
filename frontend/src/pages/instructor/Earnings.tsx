import React, { useState, useEffect } from 'react';
import './Earnings.css';

interface EarningsSummary {
  currentBalance: number;
  pendingBalance: number;
  lifetimeEarnings: number;
  revenueSharingModel: string;
  instructorPercentage: number;
  totalSales: number;
  totalTransactions: number;
  averageTransactionValue: number;
  lastPayoutDate?: Date;
  lastPayoutAmount?: number;
  nextPayoutDate?: Date;
  minimumPayoutAmount: number;
  pendingShares: number;
  recentPayouts: any[];
  courseEarnings: {
    courseId: string;
    courseName: string;
    totalEarnings: number;
    salesCount: number;
    lastSaleDate?: Date;
  }[];
}

export const Earnings: React.FC = () => {
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  useEffect(() => {
    fetchEarningsSummary();
  }, []);

  const fetchEarningsSummary = async () => {
    try {
      const response = await fetch('/api/monetization/instructor/earnings/summary');
      const data = await response.json();

      if (data.success) {
        setSummary(data.summary);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching earnings summary:', error);
      setLoading(false);
    }
  };

  const handleRequestPayout = async () => {
    try {
      const response = await fetch('/api/monetization/instructor/earnings/request-payout', {
        method: 'POST'
      });

      const data = await response.json();

      if (data.success) {
        alert('Payout requested successfully!');
        fetchEarningsSummary();
        setShowPayoutModal(false);
      }
    } catch (error) {
      console.error('Error requesting payout:', error);
    }
  };

  if (loading) {
    return (
      <div className="earnings-page">
        <div className="loading">Loading earnings...</div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="earnings-page">
        <div className="error">Unable to load earnings data</div>
      </div>
    );
  }

  return (
    <div className="earnings-page">
      <div className="earnings-header">
        <h1>Instructor Earnings</h1>
        <button
          className="payout-button"
          onClick={() => setShowPayoutModal(true)}
          disabled={summary.currentBalance < summary.minimumPayoutAmount}
        >
          Request Payout
        </button>
      </div>

      <div className="earnings-overview">
        <div className="stat-card primary">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-label">Current Balance</div>
            <div className="stat-value">${summary.currentBalance.toFixed(2)}</div>
            <div className="stat-description">
              Available for payout
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-label">Pending Balance</div>
            <div className="stat-value">${summary.pendingBalance.toFixed(2)}</div>
            <div className="stat-description">
              {summary.pendingShares} pending shares
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-label">Lifetime Earnings</div>
            <div className="stat-value">${summary.lifetimeEarnings.toFixed(2)}</div>
            <div className="stat-description">
              {summary.totalTransactions} transactions
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-label">Revenue Share</div>
            <div className="stat-value">{summary.instructorPercentage}%</div>
            <div className="stat-description">
              {summary.revenueSharingModel} model
            </div>
          </div>
        </div>
      </div>

      <div className="earnings-content">
        <div className="earnings-main">
          <div className="course-earnings-section">
            <h2>Earnings by Course</h2>
            <div className="course-earnings-table">
              <table>
                <thead>
                  <tr>
                    <th>Course Name</th>
                    <th>Total Earnings</th>
                    <th>Sales Count</th>
                    <th>Avg. per Sale</th>
                    <th>Last Sale</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.courseEarnings.map((course) => (
                    <tr key={course.courseId}>
                      <td className="course-name">{course.courseName}</td>
                      <td className="earnings-amount">
                        ${course.totalEarnings.toFixed(2)}
                      </td>
                      <td>{course.salesCount}</td>
                      <td>
                        ${(course.totalEarnings / course.salesCount).toFixed(2)}
                      </td>
                      <td className="date">
                        {course.lastSaleDate
                          ? new Date(course.lastSaleDate).toLocaleDateString()
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="payout-history-section">
            <h2>Recent Payouts</h2>
            <div className="payout-list">
              {summary.recentPayouts.length === 0 ? (
                <div className="empty-state">
                  <p>No payouts yet</p>
                </div>
              ) : (
                summary.recentPayouts.map((payout) => (
                  <div key={payout.payoutId} className="payout-item">
                    <div className="payout-info">
                      <div className="payout-id">{payout.payoutId}</div>
                      <div className="payout-period">
                        {new Date(payout.periodStart).toLocaleDateString()} -{' '}
                        {new Date(payout.periodEnd).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="payout-amount">
                      ${payout.totalAmount.toFixed(2)}
                    </div>
                    <div className={`payout-status status-${payout.status}`}>
                      {payout.status}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="earnings-sidebar">
          <div className="payout-info-card">
            <h3>Next Payout</h3>
            {summary.nextPayoutDate ? (
              <>
                <div className="next-payout-date">
                  {new Date(summary.nextPayoutDate).toLocaleDateString()}
                </div>
                <div className="payout-details">
                  <div className="detail-row">
                    <span>Minimum amount:</span>
                    <span>${summary.minimumPayoutAmount.toFixed(2)}</span>
                  </div>
                  <div className="detail-row">
                    <span>Current balance:</span>
                    <span>${summary.currentBalance.toFixed(2)}</span>
                  </div>
                  {summary.currentBalance >= summary.minimumPayoutAmount ? (
                    <div className="payout-ready">
                      ✓ Ready for payout
                    </div>
                  ) : (
                    <div className="payout-not-ready">
                      ${(summary.minimumPayoutAmount - summary.currentBalance).toFixed(2)}{' '}
                      more needed
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="no-payout">
                No upcoming payout scheduled
              </div>
            )}
          </div>

          <div className="stats-card">
            <h3>Performance Stats</h3>
            <div className="stat-item">
              <span className="stat-label">Total Sales</span>
              <span className="stat-value">${summary.totalSales.toFixed(2)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Transactions</span>
              <span className="stat-value">{summary.totalTransactions}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Avg. Transaction</span>
              <span className="stat-value">
                ${summary.averageTransactionValue.toFixed(2)}
              </span>
            </div>
            {summary.lastPayoutDate && (
              <>
                <div className="stat-divider" />
                <div className="stat-item">
                  <span className="stat-label">Last Payout</span>
                  <span className="stat-value">
                    ${summary.lastPayoutAmount?.toFixed(2)}
                  </span>
                </div>
                <div className="stat-date">
                  {new Date(summary.lastPayoutDate).toLocaleDateString()}
                </div>
              </>
            )}
          </div>

          <div className="help-card">
            <h3>Need Help?</h3>
            <p>
              Have questions about your earnings or payouts? Check out our
              instructor help center or contact support.
            </p>
            <button className="help-button">Visit Help Center</button>
          </div>
        </div>
      </div>

      {showPayoutModal && (
        <div className="modal-overlay" onClick={() => setShowPayoutModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Request Payout</h2>
              <button
                className="close-button"
                onClick={() => setShowPayoutModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="payout-summary">
                <div className="summary-row">
                  <span>Current Balance:</span>
                  <span className="amount">
                    ${summary.currentBalance.toFixed(2)}
                  </span>
                </div>
                <div className="summary-row">
                  <span>Your Share:</span>
                  <span>{summary.instructorPercentage}%</span>
                </div>
                <div className="summary-divider" />
                <div className="summary-row total">
                  <span>Payout Amount:</span>
                  <span className="amount">
                    ${summary.currentBalance.toFixed(2)}
                  </span>
                </div>
              </div>
              <p className="modal-description">
                Your payout will be processed within 5-7 business days using
                your configured payment method.
              </p>
            </div>
            <div className="modal-actions">
              <button
                className="cancel-button"
                onClick={() => setShowPayoutModal(false)}
              >
                Cancel
              </button>
              <button
                className="confirm-button"
                onClick={handleRequestPayout}
              >
                Confirm Payout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Earnings;
