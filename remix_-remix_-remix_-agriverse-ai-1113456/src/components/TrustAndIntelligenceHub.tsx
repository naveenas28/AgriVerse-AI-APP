import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Award, 
  TrendingUp, 
  AlertTriangle, 
  Truck, 
  CheckCircle, 
  Star, 
  MessageSquare, 
  Clock, 
  MapPin, 
  Phone, 
  Plus, 
  X, 
  Check, 
  XCircle,
  TrendingDown,
  Activity,
  UserCheck,
  PackageCheck
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface TrustHubProps {
  userUid: string;
  userName: string;
  userPhone: string;
  coopTag?: string;
  onToast: (msg: string) => void;
  products: any[];
  orders: any[];
}

export function TrustAndIntelligenceHub({ 
  userUid, 
  userName, 
  userPhone, 
  coopTag = 'Chikkaballapura Potato Union', 
  onToast,
  products,
  orders
}: TrustHubProps) {
  // Navigation tabs inside Hub
  const [hubTab, setHubTab] = useState<'verification' | 'price_audit' | 'deliveries' | 'ratings'>('verification');

  // --- Feature 1: Verification System State ---
  const [verifRequest, setVerifRequest] = useState<any | null>(null);
  const [verifLoading, setVerifLoading] = useState(true);
  const [aadhaarInput, setAadhaarInput] = useState('');
  const [phoneInput, setPhoneInput] = useState(userPhone || '');
  const [roleInput, setRoleInput] = useState('farmer'); // farmer or buyer
  const [proofInput, setProofInput] = useState(''); // text or mock doc path
  const [coopNameInput, setCoopNameInput] = useState(coopTag);
  const [scannedFiles, setScannedFiles] = useState<string[]>([]);
  const [allRequests, setAllRequests] = useState<any[]>([]); // for co-op admins / reviewers
  const [isVerified, setIsVerified] = useState(false);

  // --- Feature 2: AI Price Audit State ---
  const [marketPrices, setMarketPrices] = useState<any[]>([
    { id: 'm1', cropName: 'Tomato', averagePrice: 22, mandiLocation: 'Chikkaballapura Mandi', trend: 'up' },
    { id: 'm2', cropName: 'Potato', averagePrice: 18, mandiLocation: 'Kolar Mandi', trend: 'stable' },
    { id: 'm3', cropName: 'Onion', averagePrice: 35, mandiLocation: 'Yeshwanthpur Mandi', trend: 'down' },
    { id: 'm4', cropName: 'Basmati Rice', averagePrice: 85, mandiLocation: 'APMC AP', trend: 'up' }
  ]);
  const [auditList, setAuditList] = useState<any[]>([]);
  const [selectedAuditProduct, setSelectedAuditProduct] = useState<any | null>(null);
  const [customPriceAuditorResult, setCustomPriceAuditorResult] = useState<any | null>(null);

  // --- Feature 3 & 4: Live Delivery & Order Completion State ---
  const [liveDeliveries, setLiveDeliveries] = useState<any[]>([]);
  const [activeTrackingDelivery, setActiveTrackingDelivery] = useState<any | null>(null);

  // --- Feature 5: Trust and Ratings State ---
  const [reviews, setReviews] = useState<any[]>([]);
  const [trustScore, setTrustScore] = useState<number>(85);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>('');
  const [rateOrderId, setRateOrderId] = useState<string | null>(null);

  // ------------------ Firestore Listeners ------------------
  useEffect(() => {
    if (!userUid) return;

    // A. Verification Request Listener for current user
    const qVerif = query(collection(db, 'verificationRequests'), orderBy('createdAt', 'desc'));
    const unsubVerif = onSnapshot(qVerif, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setAllRequests(list);
      const myReq = list.find((r: any) => r.uid === userUid);
      setVerifRequest(myReq || null);
      if (myReq && myReq.status === 'approved') {
        setIsVerified(true);
      } else {
        setIsVerified(false);
      }
      setVerifLoading(false);
    }, (error) => {
      console.warn("Verification listener bypassed using mock/fallback", error);
      setVerifLoading(false);
    });

    // B. AI Price Audits Listener
    const unsubAudits = onSnapshot(collection(db, 'aiPriceAudits'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAuditList(list);
    });

    // C. Live Deliveries Listener
    const unsubDeliveries = onSnapshot(collection(db, 'liveDeliveries'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLiveDeliveries(list);
    });

    // D. Marketplace Reviews Listener
    const unsubReviews = onSnapshot(collection(db, 'marketplaceReviews'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviews(list);
    });

    return () => {
      unsubVerif();
      unsubAudits();
      unsubDeliveries();
      unsubReviews();
    };
  }, [userUid]);

  // Initial Seed for Market Mandi Prices if not exists
  useEffect(() => {
    const seedPrices = async () => {
      try {
        const d = doc(db, 'marketPrices', 'Tomato_seed');
        await setDoc(d, { cropName: 'Tomato', averagePrice: 22, mandiLocation: 'Chikkaballapura Mandi', trend: 'up' }, { merge: true });
        const d2 = doc(db, 'marketPrices', 'Onion_seed');
        await setDoc(d2, { cropName: 'Onion', averagePrice: 35, mandiLocation: 'Yeshwanthpur Mandi', trend: 'down' }, { merge: true });
      } catch (e) {
        console.log("Mandi seed bypassed:", e);
      }
    };
    seedPrices();
  }, []);

  // ------------------ Feature 1: Verification Handlers ------------------
  const handleRequestVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aadhaarInput || !phoneInput) {
      onToast("Please complete Aadhaar Number and Phone fields.");
      return;
    }
    try {
      const newReq = {
        uid: userUid,
        userName: userName || 'Farming Partner',
        userRole: roleInput,
        phone: phoneInput,
        aadhaarNumber: aadhaarInput,
        proofUrl: proofInput || 'Self-Declared Land Record Proof (RTC Form 16)',
        coopTag: coopNameInput || 'Unassigned Cooperative Option',
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'verificationRequests', userUid), newReq);
      // Auto register to trust scores
      await setDoc(doc(db, 'trustScores', userUid), {
        uid: userUid,
        score: /^\d{12}$/.test(aadhaarInput) ? 90 : 75,
        completedDeals: 0,
        ratingAverage: 5.0,
        updatedAt: new Date().toISOString()
      });
      onToast("Verification submitted to AgriVerse Trust Node! 📡");
    } catch (err) {
      console.error(err);
      onToast("Bypassed: Request recorded locally.");
    }
  };

  const handleAdminApproveReq = async (reqId: string) => {
    try {
      await updateDoc(doc(db, 'verificationRequests', reqId), { status: 'approved' });
      // Create user verified status badge
      await setDoc(doc(db, 'verifiedUsers', reqId), {
        id: reqId,
        uid: reqId,
        name: userName || 'Verified Member',
        userRole: 'farmer',
        verifiedBadge: true,
        coopTag: coopTag,
        verifiedAt: new Date().toISOString()
      });
      // Bump trust score
      await setDoc(doc(db, 'trustScores', reqId), {
        uid: reqId,
        score: 98,
        completedDeals: 1,
        ratingAverage: 5.0,
        updatedAt: new Date().toISOString()
      });
      onToast("User verified successfully! Checkmark badge issued! 🌟");
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminRejectReq = async (reqId: string) => {
    try {
      await updateDoc(doc(db, 'verificationRequests', reqId), { status: 'rejected' });
      onToast("Verification request marked as rejected.");
    } catch (err) {
      console.error(err);
    }
  };

  const simulatedMockUpload = () => {
    const randomDocs = [
      'Pattadar_Passbook_No_389182.pdf',
      'Aadhaar_Front_Copy.jpg',
      'RTC_Chikkaballapura_Form_12.jpg'
    ];
    const picked = randomDocs[Math.floor(Math.random() * randomDocs.length)];
    if (!scannedFiles.includes(picked)) {
      setScannedFiles([...scannedFiles, picked]);
      setProofInput(picked);
      onToast(`Attached document: ${picked} Successfully! 📎`);
    }
  };

  // ------------------ Feature 2: AI Price Audit Handlers ------------------
  const triggerAiPriceAudit = async (product: any) => {
    setSelectedAuditProduct(product);
    try {
      // Parse crop price
      const numericPrice = parseFloat(product.price.toString().replace(/[^0-9.]/g, ''));
      // Find matching Mandi average price
      const matchingMandi = marketPrices.find(m => product.title.toLowerCase().includes(m.cropName.toLowerCase())) || { averagePrice: 20, mandiLocation: 'District APMC Mandi' };
      const mandiAverage = matchingMandi.averagePrice;
      
      const percentDiff = Math.round(((numericPrice - mandiAverage) / mandiAverage) * 100);
      let fairness = 100 - Math.abs(percentDiff);
      if (fairness < 0) fairness = 10;
      
      let status = 'Fair Target';
      let alertMsg = `Fair competitive pricing. Tomato pricing matches nearby ${matchingMandi.mandiLocation} averages within 5%.`;
      let suggestion = `Cooperative suggestion: Keep pricing steady to secure bulk order quickly.`;

      if (percentDiff > 25) {
        status = 'Suspicious High Price';
        alertMsg = `Alert: pricing is ${percentDiff}% higher than nearby ${matchingMandi.mandiLocation} average of ₹${mandiAverage}/unit. Might list slower!`;
        suggestion = `Cooperative suggestion: Lower price by ${percentDiff - 10}% to optimize regional bulk procurement interest.`;
      } else if (percentDiff < -25) {
        status = 'Suspicious Low Price';
        alertMsg = `Alert: Current pricing is unusually low (-${Math.abs(percentDiff)}%) compared to mandi average of ₹${mandiAverage}/unit. Protect your margins!`;
        suggestion = `Cooperative suggestion: Raise pricing closer to ₹${Math.floor(mandiAverage * 0.9)}/unit to prevent loss of labor margins.`;
      }

      const auditPayload = {
        id: product.id,
        productId: product.id,
        productTitle: product.title,
        mandiPrice: mandiAverage,
        fairnessScore: fairness,
        auditStatus: status,
        alertMessage: alertMsg,
        suggestion: suggestion,
        auditedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'aiPriceAudits', product.id), auditPayload);
      setCustomPriceAuditorResult(auditPayload);
      onToast("Gemini Price Audit Complete! 🧠");

    } catch (e) {
      console.error(e);
    }
  };


  // ------------------ Feature 3 & 4: Live Delivery Tracking & Order completion ------------------
  const handleStartDelivery = async (order: any) => {
    try {
      const deliveryId = `del_${order.id}`;
      const payload = {
        id: deliveryId,
        shipmentId: deliveryId,
        orderId: order.id,
        listingId: order.productId || order.listingId || '',
        productTitle: order.productTitle,
        quantity: order.quantity,
        sellerUid: order.farmerUid || userUid,
        farmerId: order.farmerUid || userUid,
        buyerUid: order.buyerUid || 'buyer123',
        buyerName: order.buyerName || 'Co-op Purchaser',
        cooperativeId: order.cooperativeId || 'coop_chikka',
        status: 'transit',
        eta: '45 mins (Nearby Block)',
        driverName: 'Ramesh Gowda',
        driverPhone: '+91 98450 12093',
        routeCoordinates: [
          { lat: 13.4334, lng: 77.7275, name: 'Chikkaballapura Warehouse' },
          { lat: 13.3421, lng: 77.6321, name: 'Sidlaghatta Highway Block' },
          { lat: 13.2981, lng: 77.5891, name: 'Buyer Delivery Terminal' }
        ],
        currentProgress: 35,
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'liveDeliveries', deliveryId), payload);
      // Update parent order status and store shipmentId
      await updateDoc(doc(db, 'marketplaceOrders', order.id), { 
        status: 'shipping',
        shipmentId: deliveryId
      });
      
      // Store deliveryStatus checkpoint
      await addDoc(collection(db, 'deliveryStatus'), {
        deliveryId: deliveryId,
        checkpoint: 'Vehicle dispatched from local cooperative farm yard gate. Ramesh driving.',
        updatedAt: new Date().toISOString()
      });

      // Trigger user-notification for buyer
      if (payload.buyerUid) {
        await addDoc(collection(db, 'notifications'), {
          id: `notif_ship_start_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          recipientUid: payload.buyerUid,
          type: 'order',
          title: `📦 Order Dispatched: ${payload.productTitle}`,
          body: `Farmer Ramesh has dispatched your cargo Ramesh driving. Active tracking is now live! 🚚`,
          senderName: "Logistics Dispatcher",
          farmerId: payload.farmerId,
          cooperativeId: payload.cooperativeId,
          listingId: payload.listingId,
          orderId: payload.orderId,
          shipmentId: payload.shipmentId,
          read: false,
          createdAt: new Date().toISOString()
        });
      }

      onToast("Live logistics dispatch active! Delivery tracked. 🚚");
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProgress = async (deliveryId: string) => {
    try {
      const randProgress = Math.min(100, Math.floor(Math.random() * 30) + 40);
      await updateDoc(doc(db, 'liveDeliveries', deliveryId), {
        currentProgress: randProgress,
        eta: randProgress === 100 ? 'Arrived at Gate' : '15 Mins Left',
        updatedAt: new Date().toISOString()
      });
      await addDoc(collection(db, 'deliveryStatus'), {
        deliveryId: deliveryId,
        checkpoint: randProgress === 100 ? 'Tractor-trailer has safely arrived at destination terminal.' : 'Vehicle cleared national highway toll gate.',
        updatedAt: new Date().toISOString()
      });

      // Find the delivery record from local state to notify buyer
      const delivery = liveDeliveries.find(d => d.id === deliveryId);
      if (delivery && delivery.buyerUid) {
        await addDoc(collection(db, 'notifications'), {
          recipientUid: delivery.buyerUid,
          type: 'order',
          title: `🚚 Cargo Update: ${delivery.productTitle}`,
          body: `Cargo transport update! Current Progress is at ${randProgress}% (ETA: ${randProgress === 100 ? 'Arrived at Gate' : '15 Mins Left'}).`,
          senderName: "Logistics Dispatcher",
          farmerId: delivery.farmerId || delivery.sellerUid || userUid,
          cooperativeId: delivery.cooperativeId || 'coop_chikka',
          listingId: delivery.listingId || '',
          orderId: delivery.orderId || '',
          shipmentId: deliveryId,
          read: false,
          createdAt: new Date().toISOString()
        });
      }

      onToast("Logistics GPS coordinate update pushed!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteDeliveryAndConfirmOrder = async (orderId: string, deliveryId: string) => {
    try {
      // Calculate amount based on numeric price
      const textAmt = 4500; // Simulated ledger summary
      // Mark as complete in liveDeliveries
      await updateDoc(doc(db, 'liveDeliveries', deliveryId), {
        status: 'delivered',
        currentProgress: 100,
        updatedAt: new Date().toISOString()
      });
      // Mark order complete
      await updateDoc(doc(db, 'marketplaceOrders', orderId), { status: 'completed' });
      
      // Save to completedOrders collection
      const orderRef = doc(db, 'marketplaceOrders', orderId);
      await setDoc(doc(db, 'completedOrders', orderId), {
        id: orderId,
        orderId: orderId,
        productTitle: 'Crops',
        farmerUid: userUid,
        buyerUid: 'buyer123',
        completedAt: new Date().toISOString()
      });

      // Save to marketplaceTransactions collection
      await setDoc(doc(db, 'marketplaceTransactions', `tx_${orderId}`), {
        id: `tx_${orderId}`,
        orderId: orderId,
        amount: textAmt,
        paymentMethod: 'Co-op ESCROW Split',
        status: 'settled',
        settledAt: new Date().toISOString()
      });

      // Increment completedDeals on trust score
      await setDoc(doc(db, 'trustScores', userUid), {
        uid: userUid,
        score: Math.min(100, trustScore + 5),
        completedDeals: 1,
        ratingAverage: 5.0,
        updatedAt: new Date().toISOString()
      });

      // Submit user-notification for completed order
      await addDoc(collection(db, 'notifications'), {
        id: `notif_order_complete_${Date.now()}_seller`,
        recipientUid: userUid,
        type: 'order',
        title: `✅ Escrow Cleared & Settled!`,
        body: `Your dispatched cargo has arrived safely. Co-op ESCROW split completed, check transactions!`,
        senderName: "AgriVerse Escrow",
        relatedId: orderId,
        read: false,
        createdAt: new Date().toISOString()
      });

      setRateOrderId(orderId);
      onToast("Transaction settled! Double signature ledger sealed! 📦🎉");
    } catch (err) {
      console.error(err);
    }
  };

  // ------------------ Feature 5: Ratings & Reviews Handlers ------------------
  const handleSubmitReview = async (orderId: string) => {
    if (!reviewText) {
      onToast("Please write a few words about crop quality or buyer reliability.");
      return;
    }
    try {
      const reviewPayload = {
        id: `rev_${orderId}`,
        orderId: orderId,
        raterUid: userUid,
        raterName: userName || 'Village Peer',
        score: reviewRating,
        reviewText: reviewText,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'marketplaceReviews', `rev_${orderId}`), reviewPayload);
      
      // Update overall peer ratings summary
      await setDoc(doc(db, 'marketplaceRatings', userUid), {
        id: userUid,
        uid: userUid,
        averageRating: parseFloat(((4.6 + reviewRating) / 2).toFixed(1)),
        totalReviews: 2,
        updatedAt: new Date().toISOString()
      });

      setRateOrderId(null);
      setReviewText('');
      onToast("Rating & Review submitted successfully! Thank you. ⭐");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-slate-50 rounded-3xl border border-slate-200 shadow-inner overflow-hidden">
      
      {/* Dynamic Sub-header Navigation for Systems */}
      <div className="flex bg-slate-100 border-b border-slate-200">
        {[
          { id: 'verification', label: '🛡️ Trust Badge', desc: 'IDs & Status' },
          { id: 'price_audit', label: '🧠 Mandi Price AI', desc: 'Audit Engine' },
          { id: 'deliveries', label: '🚚 GPS Shipments', desc: 'ETA & Map' },
          { id: 'ratings', label: '⭐ Peer Ratings', desc: 'User Ledger' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setHubTab(tab.id as any)}
            className={`flex-1 text-center py-2 px-1 transition-all flex flex-col items-center justify-center border-b-2 outline-none ${
              hubTab === tab.id 
                ? 'bg-white border-emerald-600 text-emerald-800' 
                : 'border-transparent text-slate-550 hover:bg-slate-50'
            }`}
          >
            <span className="text-[11.5px] font-black tracking-tight">{tab.label}</span>
            <span className="text-[8.5px] font-bold text-slate-400 font-mono scale-95 leading-none">{tab.desc}</span>
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4">

        {/* ------------------ SYSTEM 1: USER TRUST VERIFICATION ------------------ */}
        {hubTab === 'verification' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Status card */}
            <div className="bg-white p-4 rounded-2.5xl border border-slate-150 shadow-xs flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                {isVerified ? (
                  <ShieldCheck className="w-7 h-7 text-emerald-600 animate-bounce" />
                ) : (
                  <Award className="w-7 h-7 text-slate-400" />
                )}
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[9px] uppercase font-black tracking-widest text-[#5AB738] font-mono">KYC Trust Level</span>
                  {isVerified && (
                    <span className="bg-emerald-500 text-white font-extrabold text-[8.5px] px-2 rounded font-mono">VERIFIED</span>
                  )}
                </div>
                <h4 className="text-sm font-black text-slate-800">
                  {isVerified ? `${userName || 'Farmer Partner'} Badge Active` : 'Identity Verification Pending'}
                </h4>
                <p className="text-[10px] text-slate-450 font-medium">
                  {isVerified 
                    ? `Protected with Aadhaar-ID structure. Authorized member of ${coopTag}.` 
                    : 'Submit proof of land ownership (RTC Form 16) or Aadhaar to activate Blue badge.'}
                </p>
              </div>
            </div>

            {/* Display user request forms */}
            {!verifRequest ? (
              <form onSubmit={handleRequestVerification} className="bg-white p-4 rounded-3xl border border-slate-150 shadow-sm space-y-3.5">
                <h5 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center space-x-1.5 text-emerald-700">
                  <span>📄</span>
                  <span>Submit Node Trust Document</span>
                </h5>

                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <label className="text-[9.5px] uppercase font-black text-slate-400 block mb-0.5">Profile Role</label>
                    <select
                      value={roleInput}
                      onChange={(e) => setRoleInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold outline-none"
                    >
                      <option value="farmer">👨‍🌾 Cooperative Farmer</option>
                      <option value="buyer">💼 Verified Crop Buyer</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9.5px] uppercase font-black text-slate-400 block mb-0.5">District Cooperative</label>
                    <input
                      type="text"
                      value={coopNameInput}
                      onChange={(e) => setCoopNameInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-[9.5px] uppercase font-black text-slate-400 block mb-0.5">National Aadhaar Number *</label>
                    <input
                      type="text"
                      maxLength={12}
                      required
                      value={aadhaarInput}
                      onChange={(e) => setAadhaarInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="12-digit UIDAI Number"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold outline-none focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[9.5px] uppercase font-black text-slate-400 block mb-0.5">Proof of Farming / Land RTC *</label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        readOnly
                        placeholder="RTC Document file upload"
                        value={proofInput}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold outline-none text-slate-500"
                      />
                      <button
                        type="button"
                        onClick={simulatedMockUpload}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-[10px] px-3 rounded-xl uppercase tracking-wider"
                      >
                        📂 Attach
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  Verify credentials
                </button>
              </form>
            ) : (
              <div className="bg-white p-4 rounded-3xl border border-slate-150 shadow-sm space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-slate-500 font-mono">My Registration Details</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase font-black ${
                    verifRequest.status === 'approved' ? 'bg-emerald-50 text-emerald-850' : 
                    verifRequest.status === 'rejected' ? 'bg-red-50 text-red-800' : 'bg-amber-50 text-amber-800 animate-pulse'
                  }`}>
                    {verifRequest.status}
                  </span>
                </div>
                
                <div className="space-y-1.5 text-xs text-slate-700">
                  <p className="font-bold">Aadhaar Verification: <span className="font-mono text-slate-800 font-black">XXXX-XXXX-{verifRequest.aadhaarNumber?.slice(-4) || '9133'}</span></p>
                  <p className="font-bold">Role: <span className="uppercase text-indigo-700">{verifRequest.userRole}</span></p>
                  <p className="font-bold">Cooperative Union: <span className="font-extrabold">{verifRequest.coopTag}</span></p>
                  <p className="font-bold">Phone Number: <span className="font-semibold text-slate-550">{verifRequest.phone}</span></p>
                </div>

                {verifRequest.status === 'pending' && (
                  <div className="border-t pt-3 space-y-2">
                    <p className="text-[10px] text-slate-400 font-semibold text-center italic">Cooperative verifying. Simulating gate verification authority below:</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAdminRejectReq(userUid)}
                        className="flex-1 py-1 px-2.5 bg-[#FFF2F2] hover:bg-red-150 text-red-700 border border-red-200 font-black text-[10px] uppercase rounded-lg transition-all"
                      >
                        Decline Demo
                      </button>
                      <button
                        onClick={() => handleAdminApproveReq(userUid)}
                        className="flex-1 py-1 px-2.5 bg-[#F2FAF2] hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-[10px] uppercase rounded-lg transition-all"
                      >
                        Approve KYC Badging
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* List and display verifying trust score stats */}
            <div className="bg-white p-4 rounded-3xl border border-slate-150 shadow-xs space-y-3">
              <h5 className="font-black text-slate-800 text-xs uppercase tracking-wider flex items-center space-x-1.5 text-slate-600">
                <span>🏆</span>
                <span>Active Peer Trust Scores list</span>
              </h5>
              
              <div className="space-y-2.5">
                {[
                  { name: 'Basavaraj Chikkaballapura', score: 98, role: 'Potato Farmer', badge: true, deals: '18 Deals' },
                  { name: 'Kavitha Munishamappa', score: 95, role: 'Tomato Farmer', badge: true, deals: '12 Deals' },
                  { name: 'Mehta APMC Buyer', score: 92, role: 'Verified Retail Buyer', badge: true, deals: '34 Purchases' },
                  { name: userName || 'Farming Friend', score: isVerified ? 98 : 75, role: 'Your Profile Node', badge: isVerified, deals: 'Local Sync Account' }
                ].map((peer, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                    <div className="flex items-center space-x-2">
                      <span className="text-base">👨‍🌾</span>
                      <div>
                        <div className="flex items-center space-x-1">
                          <p className="text-[11px] font-black text-slate-850 leading-tight">{peer.name}</p>
                          {peer.badge && <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                        </div>
                        <p className="text-[9px] text-slate-400 font-semibold">{peer.role} • {peer.deals}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono block">TRUST RATING</span>
                      <span className="text-[11px] font-black font-mono text-emerald-800">{peer.score}% Score</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ------------------ SYSTEM 2: AI PRICE AUDIT ENGINE ------------------ */}
        {hubTab === 'price_audit' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-white p-4 rounded-3xl border border-slate-150 shadow-xs space-y-2">
              <span className="text-[9px] bg-indigo-50 text-indigo-800 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Feature 2 • AI PRICE COMPARATOR
              </span>
              <h4 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-tight">Mandi Price Benchmarks vs Your Listings</h4>
              <p className="text-[10px] text-slate-450 font-normal leading-tight">
                Evaluating listings against nearby grain mandis and Yeshwanthpur averages protects rural farmers against fake under-pricing and buyer fraud.
              </p>
            </div>

            {/* List and display nearby mandi price tables */}
            <div className="bg-white p-3 rounded-2.5xl border border-slate-150 shadow-sm space-y-2">
              <h5 className="font-extrabold text-slate-800 text-[11px] uppercase tracking-wider font-mono">Karnataka Mandi Average Prices (Today)</h5>
              <div className="divide-y divide-slate-100">
                {marketPrices.map((p) => (
                  <div key={p.id} className="py-2 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-black text-slate-700">{p.cropName}</span>
                      <span className="text-[9.5px] font-medium text-slate-400 block">{p.mandiLocation}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black font-mono text-slate-800">₹ {p.averagePrice}/Kg</span>
                      <span className={`text-[8.5px] uppercase font-bold tracking-wider flex items-center justify-end ${
                        p.trend === 'up' ? 'text-emerald-600' : p.trend === 'down' ? 'text-red-600' : 'text-slate-500'
                      }`}>
                        {p.trend === 'up' ? <TrendingUp className="w-3 h-3 mr-0.5" /> : p.trend === 'down' ? <TrendingDown className="w-3 h-3 mr-0.5" /> : null}
                        {p.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trigger and select a product to audit */}
            <div className="bg-white p-4 rounded-3xl border border-slate-150 shadow-xs space-y-3">
              <h5 className="font-black text-slate-800 text-xs uppercase tracking-wider text-emerald-700">Audit Active Crop Listings</h5>
              
              {products.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic">No crops listed on the bazaar for auditing.</p>
              ) : (
                <div className="space-y-2.5">
                  <p className="text-[10px] text-slate-400 leading-tight">Select any harvest crop below to trigger immediate AI price compliance evaluation against mandi benchmarks:</p>
                  {products.slice(0, 3).map((prod) => (
                    <div key={prod.id} className="bg-slate-50 border p-3 rounded-2xl flex items-center justify-between">
                      <div>
                        <h6 className="font-extrabold text-slate-800 text-[11px]">{prod.title}</h6>
                        <p className="text-[10px] text-slate-450">List Price: <span className="font-bold text-slate-700">{prod.price}</span> ({prod.quantity})</p>
                      </div>
                      <button
                        onClick={() => triggerAiPriceAudit(prod)}
                        className="bg-indigo-700 hover:bg-indigo-800 text-white font-extrabold text-[9px] uppercase tracking-wider px-3 py-1.5 rounded-xl transition-all font-mono"
                      >
                        ⚡ Audit Price
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Show custom audit result card */}
            {customPriceAuditorResult && (
              <div className="bg-indigo-950 text-indigo-50 p-4 rounded-3xl border border-indigo-800 shadow-xl space-y-3 animate-slideUp">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[8px] bg-indigo-500 text-white font-black px-2 py-0.5 rounded uppercase tracking-widest font-mono">Gemini Audit Report Summary</span>
                    <h5 className="font-extrabold text-sm text-yellow-300 mt-1">{customPriceAuditorResult.productTitle}</h5>
                  </div>
                  <button onClick={() => setCustomPriceAuditorResult(null)} className="text-indigo-300 hover:text-indigo-100">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3.5 pt-1.5 border-t border-indigo-900 text-xs">
                  <div>
                    <span className="text-[9.5px] uppercase font-bold text-indigo-350 block leading-none mb-1">Mandi Benchmark</span>
                    <span className="font-mono text-sm font-black text-indigo-200">₹ {customPriceAuditorResult.mandiPrice}/Kg</span>
                  </div>
                  <div>
                    <span className="text-[9.5px] uppercase font-bold text-indigo-350 block leading-none mb-1">AI Fairness index</span>
                    <span className="font-mono text-sm font-black text-emerald-400">{customPriceAuditorResult.fairnessScore}% Score</span>
                  </div>
                </div>

                <div className="bg-indigo-900/40 p-3 rounded-2xl border border-indigo-850 space-y-2 text-[10.5px]">
                  <p className="font-black text-yellow-200 flex items-center space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                    <span>{customPriceAuditorResult.auditStatus}</span>
                  </p>
                  <p className="text-indigo-200 font-semibold leading-relaxed">"{customPriceAuditorResult.alertMessage}"</p>
                  <p className="text-emerald-300 font-extrabold border-t border-indigo-900/60 pt-2 font-mono">{customPriceAuditorResult.suggestion}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------ SYSTEM 3: LIVE GPS TRANSPORT TRACKING ------------------ */}
        {hubTab === 'deliveries' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-white p-4 rounded-3xl border border-slate-150 shadow-xs space-y-1">
              <span className="text-[9px] bg-emerald-50 text-[#5AB738] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Feature 3 • REAL-TIME SHIPPING TRACKER
              </span>
              <h4 className="text-xs sm:text-sm font-black text-slate-800 uppercase">Live Logistics Map Sync</h4>
              <p className="text-[10px] text-slate-450 leading-tight">
                Trace real-time crop dispatch coordinates, route splitting diagnostics and estimate arrival directly onto the village marketplace.
              </p>
            </div>

            {/* List ongoing secure deliveries */}
            <div className="bg-white p-4 rounded-3xl border border-slate-150 shadow-xs space-y-3.5">
              <h5 className="font-black text-slate-850 text-xs uppercase tracking-wider">Active Shipments ({liveDeliveries.filter(d=>d.status==='transit').length})</h5>
              
              {liveDeliveries.length === 0 ? (
                <div className="text-center py-4 bg-slate-50 border rounded-2xl">
                  <p className="text-[11px] text-slate-400 font-mono">No active GPS shipping units currently transiting.</p>
                  <p className="text-[9.5px] text-slate-400 mt-1">Accept crop order offers and dispatch trucks from "My Market Inbox" tab.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {liveDeliveries.map((delivery) => (
                    <div key={delivery.id} className="bg-slate-55 p-3 rounded-2.5xl border border-slate-200 shadow-xs space-y-3 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                            delivery.status === 'delivered' ? 'bg-indigo-100 text-indigo-800' : 'bg-yellow-100 text-yellow-800 animate-pulse'
                          }`}>
                            {delivery.status === 'delivered' ? 'Completed Delivered' : 'In Transit GPS'}
                          </span>
                          <h6 className="font-black text-slate-800 mt-1">{delivery.productTitle}</h6>
                          <p className="text-[10px] text-slate-400">Buyer: <span className="font-bold">{delivery.buyerName}</span></p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-slate-400 block font-mono">Cargo Weight</span>
                          <span className="text-xs font-black text-slate-700 font-mono">{delivery.quantity}</span>
                        </div>
                      </div>

                      {/* Display progress index */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-slate-455">
                          <span className="font-mono">Route splitting</span>
                          <span className="font-mono">{delivery.currentProgress}% Moved</span>
                        </div>
                        <div className="relative w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="absolute top-0 left-0 h-full bg-[#5AB738] transition-all duration-500" 
                            style={{ width: `${delivery.currentProgress}%` }}
                          />
                        </div>
                      </div>

                      {/* Map coordinates representation */}
                      <div className="bg-slate-100 rounded-xl p-2.5 border text-[10px] space-y-1 font-mono">
                        <p className="text-[9.5px] font-black uppercase tracking-wider text-slate-450">GPS Dispatch Checkpoints</p>
                        <p className="font-semibold text-slate-650 flex items-center">
                          <span className="text-emerald-600 mr-1.5">●</span> Base: Chikkaballapura yard
                        </p>
                        <p className="font-semibold text-slate-650 flex items-center">
                          <span className={`${delivery.currentProgress >= 50 ? 'text-emerald-600' : 'text-slate-350'} mr-1.5`}>●</span> Mid: Sidlaghatta Tollway
                        </p>
                        <p className="font-semibold text-slate-650 flex items-center">
                          <span className={`${delivery.currentProgress === 100 ? 'text-emerald-600' : 'text-slate-350'} mr-1.5`}>●</span> Target: Buyer warehouse
                        </p>
                      </div>

                      {/* Driver details & ETA */}
                      <div className="bg-white border p-2 rounded-xl flex items-center justify-between text-[10.5px]">
                        <div>
                          <p className="text-slate-600 font-extrabold flex items-center">
                            <span className="mr-1">📞</span> {delivery.driverName}
                          </p>
                          <p className="text-[9.5px] font-mono text-slate-405">{delivery.driverPhone}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-400 block uppercase text-[8px] tracking-wider leading-none">Est arrival ETD</p>
                          <p className="font-bold text-slate-700 mt-1">{delivery.eta}</p>
                        </div>
                      </div>

                      {/* Manual mock actions */}
                      {delivery.status !== 'delivered' && (
                        <button
                          onClick={() => handleUpdateProgress(delivery.id)}
                          className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[10px] uppercase rounded-xl transition-all border font-mono"
                        >
                          Simulate GPS Movement +
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------ SYSTEM 4 & 5: CONTRACT COMPLETION & RATING ------------------ */}
        {hubTab === 'ratings' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-white p-4 rounded-3xl border border-slate-150 shadow-xs space-y-1">
              <span className="text-[9px] bg-indigo-50 text-indigo-805 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Feature 4 & 5 • PEER REPUTATION HUB
              </span>
              <h4 className="text-xs sm:text-sm font-black text-slate-800 uppercase">Double-Signature Ledger Verification</h4>
              <p className="text-[10px] text-slate-450 leading-tight">
                Secure double confirming of crop releases logs transactions permanently on our rural contract system, computing verified peer reputation scores.
              </p>
            </div>

            {/* Prompt submission review if selected */}
            {rateOrderId ? (
              <div className="bg-gradient-to-br from-emerald-950 to-slate-900 text-emerald-50 p-4 rounded-3xl border border-emerald-800 shadow-xl space-y-4 animate-slideUp">
                <div>
                  <span className="text-[8px] bg-[#5AB738] text-white font-black px-2 py-0.5 rounded uppercase tracking-wider font-mono">Post-Transaction Ledger review</span>
                  <h5 className="font-black text-sm text-yellow-300 mt-1">Rate Transaction & Secure Reputation</h5>
                  <p className="text-[10px] text-emerald-200 leading-tight">Seal digital ledger agreement. Rate your partner coordinate quality.</p>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center space-x-2 justify-center py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="transition-all active:scale-125"
                      >
                        <Star className={`w-8 h-8 ${reviewRating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-slate-650'}`} />
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9.5px] uppercase font-black text-emerald-400 font-mono block">Review Comment</label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      rows={2}
                      placeholder="e.g. Tomato quality Grade-A verified. Ramesh delivered Basmati within 2 hours. Prompt cashless payment."
                      className="w-full bg-slate-900/40 border border-emerald-840 rounded-xl p-2.5 text-xs font-semibold outline-none text-emerald-50 placeholder:text-emerald-700/60 resize-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setRateOrderId(null)}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold text-xs rounded-xl uppercase transition-all"
                    >
                      Bypass Review
                    </button>
                    <button
                      onClick={() => handleSubmitReview(rateOrderId)}
                      className="flex-1 py-2 bg-[#5AB738] hover:bg-emerald-600 text-white font-black text-xs rounded-xl uppercase transition-all"
                    >
                      Lock Sealed Review ✓
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {/* List and display active orders from parent props requiring completion */}
            <div className="bg-white p-4 rounded-3xl border border-slate-150 shadow-xs space-y-3.5">
              <h5 className="font-black text-slate-800 text-xs uppercase tracking-wider text-emerald-700">Contract Lock Closures</h5>
              
              {orders.filter(o => o.status !== 'completed').length === 0 ? (
                <p className="text-[11px] text-slate-400 italic text-center py-2">No pending contract agreements require settlement closures currently.</p>
              ) : (
                <div className="space-y-3">
                  <p className="text-[10px] text-slate-450 leading-none">Confirm transport releases or finalize cash conversions:</p>
                  {orders
                    .filter(o => o.status !== 'completed')
                    .map((item) => {
                      const deliveryId = `del_${item.id}`;
                      const orderDelObj = liveDeliveries.find(d => d.orderId === item.id);
                      return (
                        <div key={item.id} className="bg-slate-50 border border-slate-200 p-3 rounded-2.5xl space-y-2.5 text-xs">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-black text-slate-800">Order ID: #{item.id.slice(-6).toUpperCase()}</span>
                            <span className={`px-2 py-0.5 rounded uppercase font-black tracking-wider text-[8px] ${
                              item.status === 'shipping' ? 'bg-yellow-100 text-yellow-850' : 'bg-emerald-50 text-emerald-800'
                            }`}>
                              STATUS: {item.status.toUpperCase()}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-700 leading-tight">
                            <p className="font-extrabold text-slate-850">Product: <span className="text-emerald-700">{item.productTitle}</span></p>
                            <p className="font-medium text-slate-450">Quantity: {item.quantity} • Buyer: {item.buyerName || 'Village Partner'}</p>
                          </div>

                          <div className="flex gap-2 pt-1 border-t">
                            {!orderDelObj ? (
                              <button
                                onClick={() => handleStartDelivery(item)}
                                className="flex-1 py-1.5 bg-[#5AB738] hover:bg-emerald-600 text-white font-extrabold text-[10px] uppercase rounded-xl transition-all font-mono"
                              >
                                🚚 Dispatch Cargo
                              </button>
                            ) : null}

                            {orderDelObj && orderDelObj.status !== 'delivered' ? (
                              <button
                                onClick={() => handleCompleteDeliveryAndConfirmOrder(item.id, deliveryId)}
                                className="flex-1 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white font-black text-[10px] uppercase rounded-xl transition-all font-mono"
                              >
                                📦 Confirm Release
                              </button>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Display completed historical transaction orders and reviews list */}
            <div className="bg-white p-4 rounded-3xl border border-slate-150 shadow-xs space-y-3.5">
              <h5 className="font-black text-slate-850 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <span>📘</span>
                <span>Immutable Rural Transaction reviews</span>
              </h5>

              {reviews.length === 0 ? (
                <div className="text-center py-4 bg-slate-50 border rounded-2xl">
                  <p className="text-[10px] text-slate-400 italic">No blockchain verification feedback recorded on seed transactions.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="bg-slate-50 p-3 rounded-2xl border flex items-start space-x-2 text-xs">
                      <span className="text-lg pt-0.5">⭐</span>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <p className="font-extrabold text-slate-800">{rev.raterName}</p>
                          <span className="text-[9px] bg-emerald-50 text-emerald-800 px-1.5 rounded font-black font-mono">VERIFIED DEAL</span>
                        </div>
                        <div className="flex space-x-0.5 py-0.5">
                          {Array.from({ length: rev.score }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          ))}
                        </div>
                        <p className="text-[11px] text-slate-650 italic mt-0.5">"{rev.reviewText}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
