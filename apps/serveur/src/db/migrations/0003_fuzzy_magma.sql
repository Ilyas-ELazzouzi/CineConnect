CREATE TABLE "film_comment_reactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"film_comment_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"value" smallint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "film_comment_reactions_comment_user_unique" UNIQUE("film_comment_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "film_comment_reactions" ADD CONSTRAINT "film_comment_reactions_film_comment_id_film_comments_id_fk" FOREIGN KEY ("film_comment_id") REFERENCES "public"."film_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "film_comment_reactions" ADD CONSTRAINT "film_comment_reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;