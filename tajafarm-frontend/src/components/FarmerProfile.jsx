import { useEffect, useState } from "react";

import Topbar from "./Topbar.jsx";
import Sidebar from "./Sidebar.jsx";
import ProductCard from "./ProductCard.jsx";

import {
    CheckIcon,
    LeafIcon,
    MessageIcon
} from "./Icons.jsx";

import { api } from "../api.js";

import {
    t
} from "../i18n.js";


const FALLBACK_IMG =
    "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=800&q=80";


export default function FarmerProfile({

    user,

    farmerId,

    cartCount,

    onNavigate,

    onAddToCart

}) {

    const [farmer, setFarmer] =
        useState(null);

    const [products, setProducts] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {

        let cancelled = false;


        if (!farmerId) {

            setError(
                "Farmer ID is missing."
            );

            setLoading(false);

            return;

        }


        setLoading(true);

        setError("");


        // Get all farmers and products
        Promise.all([

            api.searchFarmers({}),

            api.getProducts()

        ])

            .then(([farmers, allProducts]) => {

                if (cancelled) return;


                const foundFarmer =
                    (farmers || []).find(
                        f =>
                            Number(f.id) ===
                            Number(farmerId)
                    );


                if (!foundFarmer) {

                    setError(
                        "Farmer profile not found."
                    );

                    setLoading(false);

                    return;

                }


                setFarmer(
                    foundFarmer
                );


                const farmerProducts =
                    (allProducts || [])

                        .filter(product => {

                            const productFarmerId =

                                product?.farmer?.id ??

                                product?.farmerId;


                            return (
                                Number(productFarmerId) ===
                                Number(farmerId)
                            );

                        });


                setProducts(
                    farmerProducts
                );

            })

            .catch(err => {

                if (!cancelled) {

                    setError(

                        err.message ||

                        "Could not load farmer profile."

                    );

                }

            })

            .finally(() => {

                if (!cancelled) {

                    setLoading(false);

                }

            });


        return () => {

            cancelled = true;

        };

    }, [farmerId]);


    if (loading) {

        return (

            <div>

                <Topbar
                    user={user}
                    cartCount={cartCount}
                    onNavigate={onNavigate}
                />

                <div className="app-body">

                    <Sidebar
                        user={user}
                        onNavigate={onNavigate}
                    />

                    <main className="main">

                        <p>

                            Loading farmer profile...

                        </p>

                    </main>

                </div>

            </div>

        );

    }


    if (error || !farmer) {

        return (

            <div>

                <Topbar
                    user={user}
                    cartCount={cartCount}
                    onNavigate={onNavigate}
                />

                <div className="app-body">

                    <Sidebar
                        user={user}
                        onNavigate={onNavigate}
                    />

                    <main className="main">

                        <button

                            className="btn btn-outline"

                            onClick={() =>
                                onNavigate("dashboard")
                            }

                        >

                            ← Back

                        </button>


                        <p
                            style={{
                                color: "#B3261E",
                                marginTop: 20
                            }}
                        >

                            {
                                error ||
                                "Farmer profile not found."
                            }

                        </p>

                    </main>

                </div>

            </div>

        );

    }


    return (

        <div>

            <Topbar
                user={user}
                cartCount={cartCount}
                onNavigate={onNavigate}
            />


            <div className="app-body">

                <Sidebar
                    user={user}
                    onNavigate={onNavigate}
                />


                <main className="main">


                    {/* BACK BUTTON */}

                    <button

                        className="btn btn-outline"

                        onClick={() =>
                            onNavigate("dashboard")
                        }

                        style={{
                            marginBottom: 20
                        }}

                    >

                        ← Back to Dashboard

                    </button>


                    {/* FARMER HEADER */}

                    <div className="card">

                        <div
                            style={{
                                display: "flex",
                                gap: 20,
                                alignItems: "center"
                            }}
                        >


                            {/* FARMER IMAGE */}

                            <div
                                style={{
                                    width: 100,
                                    height: 100,
                                    borderRadius: "50%",
                                    overflow: "hidden",
                                    flexShrink: 0
                                }}
                            >

                                <img

                                    src={
                                        farmer.profileImage ||
                                        FALLBACK_IMG
                                    }

                                    alt={farmer.name}

                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover"
                                    }}

                                />

                            </div>


                            {/* FARMER INFO */}

                            <div>

                                <h2
                                    style={{
                                        marginBottom: 6
                                    }}
                                >

                                    {farmer.name}

                                    <CheckIcon />

                                </h2>


                                <p
                                    style={{
                                        color: "var(--muted)"
                                    }}
                                >

                                    📍 {

                                        farmer.location ||
                                        "नेपाल"

                                    }

                                </p>


                                <p
                                    style={{
                                        marginTop: 10
                                    }}
                                >

                                    <LeafIcon />

                                    {" "}

                                    स्थानीय किसान

                                </p>

                            </div>

                        </div>

                    </div>


                    {/* ABOUT */}

                    <div
                        className="card"

                        style={{
                            marginTop: 20
                        }}
                    >

                        <h3>

                            About Farmer

                        </h3>


                        <p
                            style={{
                                color: "var(--muted)",
                                marginTop: 10
                            }}
                        >

                            {
                                farmer.description ||

                                "This farmer provides fresh and locally produced agricultural products."
                            }

                        </p>

                    </div>


                    {/* CONTACT */}

                    <div
                        className="card"

                        style={{
                            marginTop: 20
                        }}
                    >

                        <h3>

                            Contact Farmer

                        </h3>


                        {farmer.whatsAppNumber ? (

                            <a

                                className="
                  btn
                  btn-primary
                "

                                style={{
                                    marginTop: 12,
                                    display: "inline-block",
                                    textDecoration: "none"
                                }}

                                href={`https://wa.me/${String(
                                    farmer.whatsAppNumber
                                ).replace(
                                    /\D/g,
                                    ""
                                )}`}

                                target="_blank"

                                rel="noopener noreferrer"
                            >

                                <MessageIcon />

                                {" "}

                                WhatsApp Farmer

                            </a>

                        ) : (

                            <p
                                style={{
                                    color: "var(--muted)",
                                    marginTop: 10
                                }}
                            >

                                Contact information is not available.

                            </p>

                        )}

                    </div>


                    {/* FARMER PRODUCTS */}

                    <div
                        className="section-head"

                        style={{
                            marginTop: 30
                        }}
                    >

                        <h3>

                            Products from {farmer.name}

                        </h3>

                    </div>


                    {products.length === 0 ? (

                        <p
                            style={{
                                color: "var(--muted)"
                            }}
                        >

                            No products available from this farmer.

                        </p>

                    ) : (

                        <section className="product-grid">

                            {products.map(product => (

                                <ProductCard

                                    key={product.id}

                                    product={product}

                                    onAddToCart={
                                        onAddToCart
                                    }

                                    onOpen={() => {

                                        onNavigate(
                                            `product:${product.id}`
                                        );

                                    }}

                                />

                            ))}

                        </section>

                    )}

                </main>

            </div>

        </div>

    );

}