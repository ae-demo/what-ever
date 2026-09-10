import { useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router";
import { Alert, ListingTable, PageContent, PageTitle } from "@wso2/oxygen-ui";
import { listCoachConnections, type CoachConnection } from "../dietApi";

export default function ConnectedDieters(): JSX.Element {
  const navigate = useNavigate();
  const [connections, setConnections] = useState<CoachConnection[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listCoachConnections()
      .then((data) => {
        if (!cancelled) setConnections(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load dieters");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>My dieters</PageTitle.Header>
      </PageTitle>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 2 }}>
        diet-api scopes /goal, /food-log and /weight-entries to the caller only,
        and CoachConnection carries an opaque dieterId with no directory to
        resolve a name from — so Goal and Last log can&apos;t be filled in for
        another user from this contract (see report). Click a row for what IS
        available: the connection and any feedback already left on it.
      </Alert>

      <ListingTable.Container>
        <ListingTable>
          <ListingTable.Head>
            <ListingTable.Row>
              <ListingTable.Cell>Dieter</ListingTable.Cell>
              <ListingTable.Cell>Goal</ListingTable.Cell>
              <ListingTable.Cell>Last log</ListingTable.Cell>
            </ListingTable.Row>
          </ListingTable.Head>
          <ListingTable.Body>
            {connections.map((c) => (
              <ListingTable.Row key={c.id} clickable onClick={() => navigate(`/dieters/${c.id}`)}>
                <ListingTable.Cell>Dieter {c.dieterId}</ListingTable.Cell>
                <ListingTable.Cell>Not available</ListingTable.Cell>
                <ListingTable.Cell>Not available</ListingTable.Cell>
              </ListingTable.Row>
            ))}
          </ListingTable.Body>
        </ListingTable>
        {!loading && connections.length === 0 && (
          <ListingTable.EmptyState title="No connected dieters" description="Dieters who invite you will appear here." />
        )}
      </ListingTable.Container>
    </PageContent>
  );
}
