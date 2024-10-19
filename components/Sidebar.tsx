'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { sidebarLinks } from '@/constants';
import { cn } from '@/lib/utils';

// Define types for optional props
interface SidebarProps {
  transcript?: string;
  sentimentLabel?: string;
}

const Sidebar = ({ transcript, sentimentLabel }: SidebarProps) => {
  const pathname = usePathname();

  return (
    <section className="sticky left-0 top-0 flex h-screen w-fit flex-col justify-between bg-dark-1 p-6 pt-28 text-white max-sm:hidden lg:w-[264px]">
      <div className="flex flex-1 flex-col gap-6">
        {sidebarLinks.map((item) => {
          const isActive = pathname === item.route || pathname.startsWith(`${item.route}/`);

          return (
            <Link
              href={item.route}
              key={item.label}
              className={cn(
                'flex gap-4 items-center p-4 rounded-lg justify-start',
                {
                  'bg-blue-1': isActive,
                }
              )}
            >
              <Image
                src={item.imgURL}
                alt={item.label}
                width={24}
                height={24}
              />
              <p className="text-lg font-semibold max-lg:hidden">
                {item.label}
              </p>
            </Link>
          );
        })}

        {/* Only display transcript and sentiment if provided */}
        {transcript && sentimentLabel && (
          <div className="flex flex-col p-4 bg-dark-2 rounded-lg">
            <h3 className="text-lg font-semibold">Real-Time Transcript</h3>
            <p>{transcript}</p>
            <h3 className="text-lg font-semibold mt-4">Sentiment</h3>
            <p>{sentimentLabel}</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Sidebar;