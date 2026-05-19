import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiX, FiZap, FiStar, FiUsers, FiCreditCard, FiGift, FiTrendingUp } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import './PricingPage.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API = API_BASE.endsWith('/api/v1') ? API_BASE : `${API_BASE}/api/v1`;

export default function PricingPage() {
    const { user } = useAuth();
    const [plans, setPlans] = useState([]);
    const [currency, setCurrency] = useState('ETB');
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [loading, setLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [couponCode, setCouponCode] = useState('');
    const [couponApplied, setCouponApplied] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('telebirr');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [processing, setProcessing] = useState(false);
    const [currentSubscription, setCurrentSubscription] = useState(null);

    useEffect(() => {
        fetchPlans();
        if (user) {
            fetchCurrentSubscription();
        }
    }, [currency, user]);

    const fetchPlans = async () => {
        try {
            const response = await fetch(`${API}/pricing/plans?currency=${currency}`);
            const data = await response.json();
            setPlans(data.plans);
        } catch (error) {
            console.error('Error fetching plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCurrentSubscription = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API}/pricing/subscriptions/current`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.has_subscription) {
                setCurrentSubscription(data);
            }
        } catch (error) {
            console.error('Error fetching subscription:', error);
        }
    };

    const handleSelectPlan = (plan) => {
        if (plan.is_custom) {
            window.location.href = 'mailto:sales@ethiocode.com';
            return;
        }
        if (plan.slug === 'free') {
            return;
        }
        setSelectedPlan(plan);
        setShowPaymentModal(true);
    };

    const applyCoupon = async () => {
        if (!couponCode || !selectedPlan) return;

        try {
            const response = await fetch(`${API}/pricing/apply-coupon`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: couponCode,
                    plan_id: selectedPlan._id,
                    billing_cycle: billingCycle
                })
            });

            if (response.ok) {
                const data = await response.json();
                setCouponApplied(data);
            } else {
                alert('Invalid or expired coupon code');
            }
        } catch (error) {
            console.error('Error applying coupon:', error);
        }
    };

    const handleSubscribe = async () => {
        if (!user) {
            alert('Please login to subscribe');
            window.location.href = '/login';
            return;
        }

        if (!phoneNumber && (paymentMethod === 'telebirr' || paymentMethod === 'cbe_birr')) {
            alert('Please enter your phone number');
            return;
        }

        setProcessing(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API}/pricing/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    plan_id: selectedPlan._id,
                    billing_cycle: billingCycle,
                    payment_method: paymentMethod,
                    coupon_code: couponApplied?.code,
                    phone_number: phoneNumber
                })
            });

            if (response.ok) {
                const data = await response.json();
                alert('Subscription successful! 🎉');
                setShowPaymentModal(false);
                fetchCurrentSubscription();
            } else {
                const error = await response.json();
                alert(error.detail || 'Subscription failed');
            }
        } catch (error) {
            console.error('Error subscribing:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const getPrice = (plan) => {
        if (plan.is_custom) return 'Custom';
        const price = billingCycle === 'monthly' ? plan.monthly_price : plan.yearly_price;
        return `${price} ${currency}`;
    };

    const getSavings = (plan) => {
        if (billingCycle === 'yearly' && plan.monthly_price) {
            const monthlyCost = plan.monthly_price * 12;
            const yearlyCost = plan.yearly_price;
            const savings = monthlyCost - yearlyCost;
            return `Save ${savings} ${currency}`;
        }
        return null;
    };

    if (loading) {
        return (
            <div className="pricing-page">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading pricing plans...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pricing-page">
            <div className="pricing-container">
                {/* Header */}
                <motion.div
                    className="pricing-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="header-badge">
                        <FiZap />
                        <span>Pricing Plans</span>
                    </div>
                    <h1 className="header-title">
                        Choose Your Perfect Plan
                    </h1>
                    <p className="header-subtitle">
                        Start learning for free, upgrade when you're ready. All plans include access to our core features.
                    </p>

                    {/* Currency & Billing Toggle */}
                    <div className="pricing-controls">
                        <div className="currency-toggle">
                            <button
                                className={currency === 'ETB' ? 'active' : ''}
                                onClick={() => setCurrency('ETB')}
                            >
                                ETB (Birr)
                            </button>
                            <button
                                className={currency === 'USD' ? 'active' : ''}
                                onClick={() => setCurrency('USD')}
                            >
                                USD ($)
                            </button>
                        </div>

                        <div className="billing-toggle">
                            <button
                                className={billingCycle === 'monthly' ? 'active' : ''}
                                onClick={() => setBillingCycle('monthly')}
                            >
                                Monthly
                            </button>
                            <button
                                className={billingCycle === 'yearly' ? 'active' : ''}
                                onClick={() => setBillingCycle('yearly')}
                            >
                                Yearly
                                <span className="save-badge">Save 17%</span>
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Current Subscription Banner */}
                {currentSubscription && (
                    <motion.div
                        className="current-subscription-banner"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <FiStar className="banner-icon" />
                        <div>
                            <h3>Active Subscription: {currentSubscription.plan.name}</h3>
                            <p>Renews on {new Date(currentSubscription.current_period_end).toLocaleDateString()}</p>
                        </div>
                    </motion.div>
                )}

                {/* Pricing Cards */}
                <div className="pricing-grid">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan._id}
                            className={`pricing-card ${plan.is_popular ? 'popular' : ''}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                        >
                            {plan.is_popular && (
                                <div className="popular-badge">
                                    <FiStar />
                                    Most Popular
                                </div>
                            )}

                            <div className="card-header">
                                <h3 className="plan-name">{plan.name}</h3>
                                <p className="plan-description">{plan.description}</p>
                                <div className="plan-price">
                                    <span className="price">{getPrice(plan)}</span>
                                    {!plan.is_custom && (
                                        <span className="period">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                                    )}
                                </div>
                                {getSavings(plan) && (
                                    <div className="savings-badge">
                                        <FiTrendingUp />
                                        {getSavings(plan)}
                                    </div>
                                )}
                            </div>

                            <div className="card-features">
                                {plan.features.map((feature, idx) => (
                                    <div key={idx} className={`feature ${feature.included ? 'included' : 'excluded'}`}>
                                        {feature.included ? <FiCheck /> : <FiX />}
                                        <span>{feature.name}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                className={`select-btn ${plan.is_popular ? 'popular-btn' : ''}`}
                                onClick={() => handleSelectPlan(plan)}
                                disabled={currentSubscription?.plan.id === plan._id}
                            >
                                {currentSubscription?.plan.id === plan._id ? 'Current Plan' : plan.button_text}
                            </button>
                        </motion.div>
                    ))}
                </div>

                {/* Features Comparison */}
                <motion.div
                    className="features-section"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    <h2>All Plans Include</h2>
                    <div className="features-grid">
                        <div className="feature-item">
                            <FiZap className="feature-icon" />
                            <h3>Fast Execution</h3>
                            <p>Lightning-fast code execution with Docker support</p>
                        </div>
                        <div className="feature-item">
                            <FiUsers className="feature-icon" />
                            <h3>Community Access</h3>
                            <p>Join thousands of Ethiopian developers</p>
                        </div>
                        <div className="feature-item">
                            <FiStar className="feature-icon" />
                            <h3>Quality Content</h3>
                            <p>Curated tutorials and challenges</p>
                        </div>
                        <div className="feature-item">
                            <FiTrendingUp className="feature-icon" />
                            <h3>Track Progress</h3>
                            <p>Monitor your learning journey</p>
                        </div>
                    </div>
                </motion.div>

                {/* FAQ Section */}
                <motion.div
                    className="faq-section"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    <h2>Frequently Asked Questions</h2>
                    <div className="faq-grid">
                        <div className="faq-item">
                            <h3>Can I switch plans later?</h3>
                            <p>Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
                        </div>
                        <div className="faq-item">
                            <h3>What payment methods do you accept?</h3>
                            <p>We accept Telebirr, CBE Birr, Chapa, and international cards via Stripe.</p>
                        </div>
                        <div className="faq-item">
                            <h3>Is there a student discount?</h3>
                            <p>Yes! Use code STUDENT50 for 50% off any plan with a valid student ID.</p>
                        </div>
                        <div className="faq-item">
                            <h3>Can I cancel anytime?</h3>
                            <p>Absolutely. Cancel anytime and you'll retain access until the end of your billing period.</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && selectedPlan && (
                <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
                    <motion.div
                        className="payment-modal"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="modal-header">
                            <h2>Complete Your Subscription</h2>
                            <button className="close-btn" onClick={() => setShowPaymentModal(false)}>×</button>
                        </div>

                        <div className="modal-body">
                            <div className="order-summary">
                                <h3>Order Summary</h3>
                                <div className="summary-row">
                                    <span>Plan:</span>
                                    <span className="highlight">{selectedPlan.name}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Billing:</span>
                                    <span>{billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Price:</span>
                                    <span>{getPrice(selectedPlan)}</span>
                                </div>
                                {couponApplied && (
                                    <>
                                        <div className="summary-row discount">
                                            <span>Discount ({couponApplied.code}):</span>
                                            <span>-{couponApplied.discount_amount} {currency}</span>
                                        </div>
                                        <div className="summary-row total">
                                            <span>Total:</span>
                                            <span className="highlight">{couponApplied.final_price} {currency}</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Coupon Code */}
                            <div className="coupon-section">
                                <FiGift className="coupon-icon" />
                                <input
                                    type="text"
                                    placeholder="Enter coupon code"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    disabled={couponApplied}
                                />
                                <button onClick={applyCoupon} disabled={couponApplied || !couponCode}>
                                    Apply
                                </button>
                            </div>

                            {/* Payment Method */}
                            <div className="payment-methods">
                                <h3>
                                    <FiCreditCard />
                                    Payment Method
                                </h3>
                                <div className="method-grid">
                                    <label className={paymentMethod === 'telebirr' ? 'active' : ''}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="telebirr"
                                            checked={paymentMethod === 'telebirr'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <span>Telebirr</span>
                                    </label>
                                    <label className={paymentMethod === 'cbe_birr' ? 'active' : ''}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="cbe_birr"
                                            checked={paymentMethod === 'cbe_birr'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <span>CBE Birr</span>
                                    </label>
                                    <label className={paymentMethod === 'chapa' ? 'active' : ''}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="chapa"
                                            checked={paymentMethod === 'chapa'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <span>Chapa</span>
                                    </label>
                                    <label className={paymentMethod === 'stripe' ? 'active' : ''}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="stripe"
                                            checked={paymentMethod === 'stripe'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <span>Card (Stripe)</span>
                                    </label>
                                </div>
                            </div>

                            {/* Phone Number for Mobile Money */}
                            {(paymentMethod === 'telebirr' || paymentMethod === 'cbe_birr') && (
                                <div className="phone-input">
                                    <input
                                        type="tel"
                                        placeholder="Phone number (e.g., 0912345678)"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                    />
                                </div>
                            )}

                            <button
                                className="subscribe-btn"
                                onClick={handleSubscribe}
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <div className="spinner-small"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <FiZap />
                                        Subscribe Now
                                    </>
                                )}
                            </button>

                            <p className="modal-footer-text">
                                By subscribing, you agree to our Terms of Service and Privacy Policy.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
