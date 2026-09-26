import React, { useMemo, useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Package,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';

export default function AIInventoryCopilot({
  kpis,
  lowStockAlerts = [],
  onSelectModule,
}) {
  const [analyzing, setAnalyzing] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const analysis = useMemo(() => {
    const totalProducts = Number(kpis?.total_products || 0);
    const totalWarehouses = Number(kpis?.total_warehouses || 0);
    const totalStock = Number(kpis?.total_stock_quantity || 0);
    const lowStockCount = Number(
      kpis?.low_stock_count ?? lowStockAlerts.length
    );

    if (totalProducts === 0) {
      return {
        score: 0,
        label: 'Waiting for inventory data',
        tone: 'neutral',
        summary:
          'Add products and warehouse data so the copilot can analyze inventory health.',
        recommendations: [
          'Create your first product with a reorder threshold.',
          'Configure at least one warehouse.',
        ],
        totalProducts,
        totalWarehouses,
        totalStock,
        lowStockCount,
      };
    }

    const riskRatio = lowStockCount / totalProducts;

    let score = 100 - Math.round(riskRatio * 100);

    if (totalStock === 0) {
      score -= 20;
    }

    score = Math.max(0, Math.min(100, score));

    let label = 'Healthy';
    let tone = 'success';

    if (score < 70) {
      label = 'Needs Attention';
      tone = 'warning';
    }

    if (score < 40) {
      label = 'High Risk';
      tone = 'danger';
    }

    const recommendations = [];

    if (lowStockCount > 0) {
      recommendations.push(
        `${lowStockCount} item${lowStockCount > 1 ? 's are' : ' is'} below the configured reorder threshold.`
      );
    } else {
      recommendations.push(
        'No products are currently below their configured reorder threshold.'
      );
    }

    if (totalWarehouses === 0) {
      recommendations.push(
        'Configure a warehouse so stock can be tracked by location.'
      );
    }

    if (totalStock === 0 && totalProducts > 0) {
      recommendations.push(
        'Products exist, but no stock quantity is currently recorded. Consider creating a receipt.'
      );
    }

    if (lowStockCount > 0) {
      recommendations.push(
        'Review the low-stock list and create receipts for products that need replenishment.'
      );
    }

    if (recommendations.length < 3) {
      recommendations.push(
        'Continue monitoring stock movements and ledger activity for changes.'
      );
    }

    return {
      score,
      label,
      tone,
      summary:
        lowStockCount > 0
          ? `The copilot detected ${lowStockCount} potential replenishment risk${lowStockCount > 1 ? 's' : ''} across your inventory.`
          : 'Current inventory levels are within the configured safety thresholds.',
      recommendations,
      totalProducts,
      totalWarehouses,
      totalStock,
      lowStockCount,
    };
  }, [kpis, lowStockAlerts]);

  const handleAnalyze = () => {
    setAnalyzing(true);

    setTimeout(() => {
      setAnalyzing(false);
    }, 700);
  };

  const visibleAlerts = showAll
    ? lowStockAlerts
    : lowStockAlerts.slice(0, 3);

  const scoreColor =
    analysis.tone === 'success'
      ? '#16A34A'
      : analysis.tone === 'warning'
        ? '#D97706'
        : analysis.tone === 'danger'
          ? '#DC2626'
          : '#64748B';

  return (
    <section
      className="app-card"
      style={{
        marginBottom: '32px',
        border: '1px solid #DBEAFE',
        background:
          'linear-gradient(135deg, #FFFFFF 0%, #F8FAFF 100%)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '24px',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              marginBottom: '6px',
            }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '9px',
                background:
                  'linear-gradient(135deg, #2563EB, #7C3AED)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={18} />
            </div>

            <div>
              <h3
                className="heading-md"
                style={{
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                AI Inventory Copilot
                <span
                  style={{
                    fontSize: '10px',
                    padding: '3px 7px',
                    borderRadius: '999px',
                    background: '#EEF2FF',
                    color: '#4F46E5',
                    fontWeight: '700',
                  }}
                >
                  AI
                </span>
              </h3>
            </div>
          </div>

          <p
            className="body-text"
            style={{
              fontSize: '13px',
              margin: 0,
              maxWidth: '650px',
            }}
          >
            Analyze your current inventory and surface replenishment
            risks and recommended actions.
          </p>
        </div>

        <button
          className="btn-secondary"
          onClick={handleAnalyze}
          disabled={analyzing}
        >
          <RefreshCw
            size={14}
            className={analyzing ? 'spin' : ''}
          />
          {analyzing ? 'Analyzing...' : 'Analyze Inventory'}
        </button>
      </div>

      {/* Score + Summary */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(220px, 0.8fr) minmax(300px, 1.2fr)',
          gap: '20px',
          marginBottom: '22px',
        }}
      >
        <div
          style={{
            padding: '20px',
            borderRadius: '12px',
            background: '#FFFFFF',
            border: '1px solid var(--color-border)',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              color: 'var(--color-text-body)',
              marginBottom: '8px',
              fontWeight: '600',
            }}
          >
            INVENTORY HEALTH SCORE
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '6px',
            }}
          >
            <span
              style={{
                fontSize: '42px',
                fontWeight: '800',
                color: scoreColor,
                lineHeight: 1,
              }}
            >
              {analysis.score}
            </span>

            <span
              style={{
                fontSize: '14px',
                color: 'var(--color-text-body)',
              }}
            >
              / 100
            </span>
          </div>

          <div
            style={{
              marginTop: '12px',
              fontSize: '13px',
              fontWeight: '700',
              color: scoreColor,
            }}
          >
            {analysis.label}
          </div>
        </div>

        <div
          style={{
            padding: '20px',
            borderRadius: '12px',
            background: '#FFFFFF',
            border: '1px solid var(--color-border)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '10px',
            }}
          >
            {analysis.lowStockCount > 0 ? (
              <AlertTriangle size={18} color="#D97706" />
            ) : (
              <CheckCircle2 size={18} color="#16A34A" />
            )}

            <strong style={{ fontSize: '14px' }}>
              Copilot Summary
            </strong>
          </div>

          <p
            style={{
              fontSize: '13px',
              lineHeight: '1.6',
              color: 'var(--color-text-body)',
              margin: 0,
            }}
          >
            {analysis.summary}
          </p>
        </div>
      </div>

      {/* Inventory Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
          marginBottom: '22px',
        }}
      >
        <Metric
          icon={<Package size={16} />}
          label="Products"
          value={analysis.totalProducts}
        />

        <Metric
          icon={<TrendingUp size={16} />}
          label="Stock Units"
          value={analysis.totalStock}
        />

        <Metric
          icon={<Package size={16} />}
          label="Warehouses"
          value={analysis.totalWarehouses}
        />

        <Metric
          icon={<AlertTriangle size={16} />}
          label="Low Stock"
          value={analysis.lowStockCount}
          warning={analysis.lowStockCount > 0}
        />
      </div>

      {/* Recommendations */}
      <div
        style={{
          padding: '18px',
          borderRadius: '12px',
          background: '#F8FAFC',
          border: '1px solid var(--color-border)',
          marginBottom: lowStockAlerts.length > 0 ? '20px' : 0,
        }}
      >
        <h4
          className="heading-md"
          style={{
            marginBottom: '12px',
            fontSize: '14px',
          }}
        >
          Recommended Actions
        </h4>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {analysis.recommendations.map((recommendation, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
                fontSize: '13px',
                color: 'var(--color-text-body)',
              }}
            >
              <Sparkles
                size={14}
                color="#6366F1"
                style={{ marginTop: '2px', flexShrink: 0 }}
              />
              <span>{recommendation}</span>
            </div>
          ))}
        </div>

        {analysis.lowStockCount > 0 && (
          <button
            className="btn-primary"
            style={{
              marginTop: '16px',
              fontSize: '13px',
            }}
            onClick={() => onSelectModule?.('receipts')}
          >
            Open Receipts & Restock
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      {/* Low Stock AI Focus */}
      {lowStockAlerts.length > 0 && (
        <div>
          <h4
            className="heading-md"
            style={{
              fontSize: '14px',
              marginBottom: '12px',
            }}
          >
            AI Focus: Replenishment Candidates
          </h4>

          <div className="app-table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Current</th>
                  <th>Reorder Point</th>
                  <th>Suggested Action</th>
                </tr>
              </thead>

              <tbody>
                {visibleAlerts.map((item) => {
                  const current = Number(item.current_stock || 0);
                  const reorder = Number(
                    item.min_reorder_point || 0
                  );

                  const suggestedQty = Math.max(
                    reorder * 2 - current,
                    1
                  );

                  return (
                    <tr key={item.id}>
                      <td style={{ fontWeight: '600' }}>
                        {item.name}
                      </td>

                      <td
                        style={{
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {item.sku}
                      </td>

                      <td
                        style={{
                          color: '#DC2626',
                          fontWeight: '700',
                        }}
                      >
                        {current}
                      </td>

                      <td>{reorder}</td>

                      <td
                        style={{
                          color: '#2563EB',
                          fontWeight: '600',
                        }}
                      >
                        Consider receiving {suggestedQty}+ units
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {lowStockAlerts.length > 3 && (
            <button
              className="btn-secondary btn-sm"
              style={{ marginTop: '12px' }}
              onClick={() => setShowAll(!showAll)}
            >
              {showAll
                ? 'Show Less'
                : `Show All ${lowStockAlerts.length} Risks`}
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function Metric({ icon, label, value, warning = false }) {
  return (
    <div
      style={{
        padding: '14px',
        borderRadius: '10px',
        background: '#FFFFFF',
        border: '1px solid var(--color-border)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: warning ? '#D97706' : 'var(--color-text-body)',
          fontSize: '11px',
          fontWeight: '600',
          marginBottom: '5px',
        }}
      >
        {icon}
        {label}
      </div>

      <div
        style={{
          fontSize: '20px',
          fontWeight: '800',
          color: warning ? '#D97706' : 'var(--color-text-heading)',
        }}
      >
        {value}
      </div>
    </div>
  );
}