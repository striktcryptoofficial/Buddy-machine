export function PageEmbed() {
  return (
    <div className="code-embed w-embed">
      <style dangerouslySetInnerHTML={{ __html: "\n/* Targets screens that are larger than 1920px */\n@media screen and (min-width: 1921px) {\n  html {\n    /* Adjust this percentage to whatever size you need */\n    font-size: 110%; \n  }\n}\n" }} />
    </div>
  );
}
