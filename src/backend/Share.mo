import Types "Types";

module {

    type Subscription = Types.Subscription;
    type SSubscription = Types.SSubscription;

    public func subscription(subscription: Subscription) : SSubscription {
        {
            availableCredits = subscription.availableCredits;
            totalCreditsUsed = subscription.totalCreditsUsed;
            planId = subscription.planId;
            state = subscription.state;
            startDate = subscription.startDate;
            nextRenewalDate = subscription.nextRenewalDate;
            expiryDate = subscription.expiryDate;
        };
    };
}