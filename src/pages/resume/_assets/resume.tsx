import type { ComponentChildren } from 'preact';
import { IconGitHub, IconLinkedIn, IconPdf } from './icons';

export const Header = () => (
	<header className="header">
		<h1>
			<span>Sid</span> <span>Vishnoi</span>
		</h1>
		<p className="tagline">Senior Full-Stack Engineer</p>
		<a
			rel="alternate"
			type="application/pdf"
			href="/resume/sudhanshu-vishnoi-resume.pdf"
			className="with-icon noprint"
			title="Download Resume as PDF"
		>
			<IconPdf />
			PDF version
		</a>
	</header>
);

export const References = () => (
	<section>
		<h2>References</h2>

		<p>
			Marcos Cáceres
			<br />
			WebKit Standards and Interop
			<br />
			<a href="mailto:marcosc@apple.com">marcosc@apple.com</a>
		</p>
	</section>
);

export const Education = () => (
	<section className="education">
		<h2>Education</h2>

		<article>
			<h3>Masters in Computer Applications</h3>
			<p>University of Delhi</p>
			<time datetime="156w">2016 &ndash; 2019</time>
		</article>

		<article>
			<h3>B.Sc. Physics (H)</h3>
			<p>University of Delhi</p>
			<time datetime="156w">2013 &ndash; 2016</time>
		</article>
	</section>
);

export const Contact = () => (
	<section className="contact">
		<h2>Contact Information</h2>

		<dl>
			<dt>
				<strong aria-hidden="true" className="no-select">
					e.
				</strong>
				<span className="visually-hidden">Email</span>
			</dt>
			<dd>
				<a href="mailto:hire@sidvishnoi.com">hire@sidvishnoi.com</a>
			</dd>

			<dt>
				<strong aria-hidden="true" className="no-select">
					w.
				</strong>
				<span className="visually-hidden">Website</span>
			</dt>
			<dd>
				<a href="https://sidvishnoi.com">sidvishnoi.com</a>
			</dd>

			<dt style="margin-top: 1em">
				<IconGitHub />
				<span className="visually-hidden">GitHub</span>
			</dt>
			<dd style="margin-top: 1em;">
				<a href="https://www.github.com/sidvishnoi">github.com/sidvishnoi</a>
			</dd>

			<dt>
				<IconLinkedIn />
				<span className="visually-hidden">LinkedIn</span>
			</dt>
			<dd>
				<a href="https://www.linkedin.com/in/sudhanshu-vishnoi/">
					linkedin.com/in/sudhanshu-vishnoi
				</a>
			</dd>
		</dl>
	</section>
);

interface ExperienceItemProps {
	title: string;
	time: string;
	duration: [start: string, end: string];
	children: ComponentChildren;
}
export const ExperienceItem = ({
	title,
	time,
	duration,
	children,
}: ExperienceItemProps) => (
	<article>
		<h3>{title}</h3>
		<time datetime={time}>
			{duration[0]} – {duration[1]}
		</time>
		<p>{children}</p>
	</article>
);
