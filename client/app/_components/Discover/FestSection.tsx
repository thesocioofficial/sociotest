import React from "react";
import { FestCard } from "./FestCard";
import { SectionHeader } from "./SectionHeader";
import moment from "moment";

interface Fest {
  id: number;
  fest_id: string;
  title: string;
  opening_date: string;
  closing_date: string;
  description: string;
  fest_image_url: string;
  organizing_dept: string;
}

interface FestsSectionProps {
  title: string;
  fests: Fest[];
  showAll?: boolean;
  baseUrl?: string;
}

export const FestsSection = ({
  title,
  fests,
  showAll = false,
  baseUrl = "fest",
}: FestsSectionProps) => {
  return (
    <div>
      <SectionHeader title={title} link="fests" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {fests.map((fest) => (
          <FestCard
            key={fest.fest_id}
            title={fest.title}
            dept={fest.organizing_dept}
            description={fest.description}
            dateRange={
              moment(fest.opening_date).format("MMM DD, YYYY") +
              " - " +
              moment(fest.closing_date).format("MMM DD, YYYY")
            }
            image={fest.fest_image_url}
            baseUrl={baseUrl}
          />
        ))}
      </div>
    </div>
  );
};
