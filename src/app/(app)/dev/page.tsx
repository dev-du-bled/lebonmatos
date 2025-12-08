"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
    const [isLoading, setIsLoading] = React.useState(false);

    const load = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
        }, 2000);
    };

    return (
        <Button variant="default" size="lg" onClick={load} loading={isLoading}>
            Charger...
        </Button>
    );
}
