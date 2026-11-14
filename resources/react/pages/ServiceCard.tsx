import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ServiceIcon } from "@/components/ServiceIcon";

export const servicesContainer = "mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-[120px]";
export const servicesFocus = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D90429]";
export const editorialHeading = "break-words text-[clamp(2.25rem,6vw,5.5rem)] font-black leading-[1.03] ltr:tracking-[-0.04em]";

export function ServiceCard({ href, title, description, number, icon, action, rtl }: {
  href: string;
  title: string;
  description?: string;
  number?: number;
  icon?: string;
  action: string;
  rtl: boolean;
}) {
  const Arrow = rtl ? ArrowLeft : ArrowRight;
  return <Link to={href} className={`group relative flex h-full min-w-0 flex-col bg-white p-6 text-[#0B0F1A] transition-colors hover:bg-[#0B0F1A] hover:text-white focus-visible:z-10 sm:p-8 ${servicesFocus}`}>
    {number !== undefined && <div className="mb-8 flex min-h-10 items-center justify-between gap-4">
      {icon && <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-xl border border-[#0B0F1A]/10 group-hover:border-white/25">
        <ServiceIcon icon={icon} size={20} />
      </span>}
      <span aria-hidden="true" className="ms-auto text-[11px] font-black tracking-[0.25em] opacity-65">{String(number).padStart(2, "0")}</span>
    </div>}
    <h3 className="break-words text-[22px] font-bold leading-[1.25] ltr:tracking-[-0.02em]">{title}</h3>
    {description && <>
      <span aria-hidden="true" className="my-5 h-px w-8 bg-[#0B0F1A]/20 transition-all group-hover:w-12 group-hover:bg-[#D90429]" />
      <p className="break-words text-[15px] leading-[1.7] opacity-75">{description}</p>
    </>}
    <div className="mt-auto flex items-center gap-2 pt-6 text-[11px] font-bold uppercase text-[#D90429] group-hover:text-white ltr:tracking-[0.2em]">
      {action}<Arrow aria-hidden="true" size={15} />
    </div>
  </Link>;
}
