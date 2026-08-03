import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, ArrowLeft, Mail, Phone, MapPin } from "lucide-react";
import { api } from "@/services/api";

interface Setting {
  key: string;
  value: string;
}

interface Section {
  title: string;
  body: React.ReactNode;
}

export const Route = createFileRoute("/_user/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
  const { data: settings, isError } = useQuery({
    queryKey: ["user-settings"],
    queryFn: () => api<Setting[]>("/settings"),
    staleTime: 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    if (isError) toast.error("Failed to load settings");
  }, [isError]);

  const storeName = settings?.find((s) => s.key === "store_name")?.value || "Template";
  const storePhone = "+8562078287509";

  const sections: Section[] = [
    {
      title: "1. Introduction",
      body: (
        <p>
          Welcome to {storeName} ("we," "our," or "us"), an online commerce platform
          providing products and services through our website and mobile applications
          (together, the "Service"). This Privacy Policy explains what information we
          collect, how we use it, and the choices you have when you use the Service.
        </p>
      ),
    },
    {
      title: "2. Information We Collect",
      body: (
        <p>
          We collect information you provide directly to us, including your name,
          email address, phone number, and shipping or billing address when you create
          an account, place an order, or contact support. We also collect order
          history, wishlist items, and cart contents to provide core features. When you
          use the Service, our servers may automatically record technical data such as
          your IP address, device type, browser, and pages visited to keep the Service
          secure and reliable.
        </p>
      ),
    },
    {
      title: "3. How We Use Information",
      body: (
        <p>
          We use the information we collect to operate, maintain, and improve the
          Service — processing and delivering orders, managing your account,
          responding to your questions, sending transactional notifications, and
          preventing fraud or abuse. We do not sell your personal information to third
          parties.
        </p>
      ),
    },
    {
      title: "4. Cookies and Local Storage",
      body: (
        <p>
          We use cookies, local storage, and similar technologies to keep you signed
          in, remember your preferences, and understand how the Service is used.
          Session data that keeps you authenticated is stored securely and never leaves
          the Service unless necessary to deliver it. You can control or clear cookies
          through your browser or device settings, though some features may not work
          without them.
        </p>
      ),
    },
    {
      title: "5. Information Sharing and Disclosure",
      body: (
        <p>
          We do not sell, rent, or trade your personal information. We may share
          limited information with trusted service providers (such as hosting,
          payment, and delivery partners) solely to operate the Service, and only when
          they agree to protect your data. We may also disclose information when
          required by law, or to protect the rights, property, and safety of our users
          or the public.
        </p>
      ),
    },
    {
      title: "6. Data Security",
      body: (
        <p>
          We implement appropriate technical and organizational measures to protect
          your information, including encrypted connections, hashed passwords, and
          restricted access to personal data. However, no method of transmission over
          the internet or electronic storage is 100% secure, and we cannot guarantee
          absolute security.
        </p>
      ),
    },
    {
      title: "7. Data Retention",
      body: (
        <p>
          We retain your account and order information for as long as your account is
          active or as needed to provide the Service, comply with legal obligations,
          resolve disputes, and enforce our agreements. When you ask us to delete your
          account, we will remove or anonymize your personal data within a reasonable
          timeframe, except where retention is required by law.
        </p>
      ),
    },
    {
      title: "8. Your Rights and Choices",
      body: (
        <p>
          Depending on your location, you may have the right to access, correct,
          update, or delete your personal information; to object to or restrict
          processing; to request a portable copy of your data; and to withdraw consent
          at any time. You can update most account details directly from your profile,
          or contact us using the details below to exercise any of these rights.
        </p>
      ),
    },
    {
      title: "9. Third-Party Services",
      body: (
        <p>
          The Service may link to external websites or use third-party tools to
          deliver functionality such as payments and delivery tracking. We do not send
          personal data to these providers beyond what is required to provide the
          feature. Their privacy practices apply to any information you share directly
          with them — please review their policies.
        </p>
      ),
    },
    {
      title: "10. Children's Privacy",
      body: (
        <p>
          The Service is not intended for children under 13, and we do not knowingly
          collect personal information from children. If you believe a child has
          provided us with personal information, please contact us immediately so we
          can remove it.
        </p>
      ),
    },
    {
      title: "11. International Data Transfers",
      body: (
        <p>
          To deliver the Service worldwide, your information may be processed in
          countries other than your own. We take steps to ensure appropriate
          safeguards are in place and that your data receives an adequate level of
          protection wherever it is processed.
        </p>
      ),
    },
    {
      title: "12. Changes to This Privacy Policy",
      body: (
        <p>
          We may update this Privacy Policy from time to time. When we do, we will
          revise the "Last updated" date at the top of this page and, where
          appropriate, notify you of material changes. Your continued use of the
          Service after changes are posted constitutes acceptance of the updated
          policy.
        </p>
      ),
    },
    {
      title: "13. Contact Information",
      body: (
        <div className="space-y-3">
          <p>If you have any questions about this Privacy Policy or your data, please contact us:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <span>souliyapps@gmail.com</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              <span data-no-translate>{storePhone}</span>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span>Laos</span>
            </li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-2 pb-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight">
          Privacy Policy
        </h1>
      </div>

      <Badge variant="secondary" className="mb-6">
        Last updated: August 3, 2026
      </Badge>

      <Separator className="mb-8" />

      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.title} className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight">{section.title}</h2>
            <div className="text-[15px] leading-relaxed text-muted-foreground">
              {section.body}
            </div>
          </section>
        ))}
      </div>

      <Separator className="my-8" />

      <p className="text-xs text-muted-foreground">
        © {new Date().getFullYear()} {storeName}. All rights reserved.
      </p>
    </div>
  );
}
