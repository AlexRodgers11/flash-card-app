import React from "react";
import styled from "styled-components";
import { FaCheck, FaTimes } from "react-icons/fa";
import { useSelector } from "react-redux";

const PricingWrapper = styled.div`
    & .strikethrough {
        text-decoration: line-through
    }
`;

export function Pricing() {
    const subscriptionStatus = useSelector((state) => state.login.subscription.status);
    const subscriptionTier = useSelector((state) => state.login.subscription.tier);
    const userId = useSelector((state) => state.login.userId);

    const isProUser = () => {
        if(subscriptionTier === "pro" && (subscriptionStatus === "active" || subscriptionStatus === "discount-grandfathered-active")) {
            return true;
        } else {
            return false;
        }
    }

    const subscriptionIsActive = () => {
        if(subscriptionStatus === "active" || subscriptionStatus === "discount-grandfathered-active") {
            return true;
        } else {
            return false;
        }
    }

    const displayBasicCard = () => {
        if(!userId) {
            return (
                <>
                    <h1 class="card-title pricing-card-title">$0<small class="text-muted fw-light">/mo</small></h1>
                    <br />
                    <button type="button" class="w-100 btn btn-lg btn-outline-primary">Sign Up for Free</button>
                </>
            )
        } else if(subscriptionTier === "pro" && subscriptionIsActive()) {
            return (
                <>
                    <h1 class="card-title pricing-card-title">$0<small class="text-muted fw-light">/mo</small></h1>
                    <br />
                    <button type="button" class="w-100 btn btn-lg btn-outline-primary">Downgrade to Basic Subscription</button>
                </>
            )
        } else {
            return (
                <>
                    <h1 class="card-title pricing-card-title">$0<small class="text-muted fw-light">/mo</small></h1>
                    <small>You are currently signed up for a basic subscription</small>
                </>
            )
        }
    }

    const displayProCard = () => {
        if(!userId) {
            return (
                <>
                <p class="card-title pricing-card-title strikethrough">$5/mo</p>
                <h1 class="card-title pricing-card-title">$3<small class="text-muted fw-light">/mo for</small> LIFE</h1>
                <ul class="list-unstyled mt-3 mb-4">
                    <li>Sign up for pro now and never pay more than $3/mo, even if you cancel your subscription and resubscribe later and the price has risen</li>
                </ul>
                <ul class="list-unstyled mt-3 mb-4">
                    <li>Cancel anytime for a prorated refund.</li>
                </ul>
                    <button type="button" class="w-100 btn btn-lg btn-primary">Get started</button>
                </>
            );
        } else if(subscriptionTier === "pro" && subscriptionIsActive()) {
            return (
                <>
                <h1 class="card-title pricing-card-title">$3<small class="text-muted fw-light">/mo for</small> LIFE</h1>
                <br />
                <small>You are currently signed up for a pro subscription</small>
                <br />
                <button type="button" class="w-100 btn btn-lg btn-danger">Cancel for a prorated refund.</button>

                </>
            );
        } else if(subscriptionTier === "pro" && !subscriptionIsActive()) {
            return (
                <>
                <p class="card-title pricing-card-title strikethrough">$5/mo</p>
                <h1 class="card-title pricing-card-title">$3<small class="text-muted fw-light">/mo for</small> LIFE</h1>
                <br />
                <ul class="list-unstyled mt-3 mb-4">
                    <li>Sign up for pro now and never pay more than $3/mo, even if you cancel your subscription and resubscribe later and the price has risen</li>
                </ul>
                <ul class="list-unstyled mt-3 mb-4">
                    <li>Cancel anytime for a prorated refund.</li>
                </ul>
                <button type="button" class="w-100 btn btn-lg btn-primary">Renew Subscription</button>
                </>
            );
        } else if(subscriptionTier === "basic") {
            return (
                <>
                <p class="card-title pricing-card-title strikethrough">$5/mo</p>
                <h1 class="card-title pricing-card-title">$3<small class="text-muted fw-light">/mo for</small> LIFE</h1>
                <ul class="list-unstyled mt-3 mb-4">
                    <li>Sign up for pro now and never pay more than $3/mo, even if you cancel your subscription and resubscribe later and the price has risen</li>
                </ul>
                <ul class="list-unstyled mt-3 mb-4">
                    <li>Cancel anytime for a prorated refund.</li>
                </ul>

                <button type="button" class="w-100 btn btn-lg btn-primary">Upgrade to Pro</button>
                </>
            );
        }
    }
    //if user is active pro user, offer downgrade to Basic, indicate current pro user in pro card
    //if user is expired pro user button says resubscribe
        //if user is discount-grandfathered have the price show just $3
        //if user is not discount-grandfathered show normal pricing
    //if user is active basic user indicate so in basic card and make pro button say upgrade

    return (
        <PricingWrapper class="container py-3">
            <div class="row row-cols-1 row-cols-md-2 mb-2 justify-content-center text-center">
                <div class="col">
                    <div class="card mb-4 rounded-3 shadow-sm">
                        <div class="card-header py-3">
                            <h4 class="my-0 fw-normal">Basic</h4>
                        </div>
                        <div class="card-body">
                            {displayBasicCard()}
                        </div>
                    </div>
                </div>
                <div class="col">
                    <div class="card mb-4 rounded-3 shadow-sm">
                        <div class="card-header py-3">
                            <h4 class="my-0 fw-normal">Pro</h4>
                        </div>
                        <div class="card-body">
                            {displayProCard()}
                        </div>
                    </div>
                </div>
            </div>

            <h2 class="display-6 text-center mb-4">Compare plans</h2>

            <div class="table-responsive">
                <table class="table text-center">
                    <thead>
                        <tr>
                            <th style={{width: "34%"}}></th>
                            <th style={{width: "22%"}}>Basic</th>
                            <th style={{width: "22%"}}>Pro</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th scope="row" class="text-start">Create Public Decks</th>
                            <td><FaCheck /></td>
                            <td><FaCheck /></td>
                        </tr>
                        <tr>
                            <th scope="row" class="text-start">Create Private Decks</th>
                            <td><FaTimes /></td>
                            <td><FaCheck /></td>
                        </tr>
                        <tr>
                            <th scope="row" class="text-start">Email Support</th>
                            <td><FaCheck /></td>
                            <td><FaCheck /></td>
                        </tr>
                        <tr>
                            <th scope="row" class="text-start">Priority Email Support</th>
                            <td><FaTimes /></td>
                            <td><FaCheck /></td>
                        </tr>
                    </tbody>

                    <tbody>
                        <tr>
                            <th scope="row" class="text-start">Max Number of Personal Decks</th>
                            <td>10</td>
                            <td>Unlimited</td>
                        </tr>
                        <tr>
                            <th scope="row" class="text-start">Max Number of Cards Per Personal Deck</th>
                            <td>30</td>
                            <td>Unlimited</td>
                        </tr>
                        <tr>
                            <th scope="row" class="text-start">Max Number of Groups You Can Join</th>
                            <td>3</td>
                            <td>Unlimited</td>
                        </tr>
                        <tr>
                            <th scope="row" class="text-start">Max Number of Groups You Can Create</th>
                            <td>1</td>
                            <td>Unlimited</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </PricingWrapper>
    );
}